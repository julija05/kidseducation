import React, { useMemo, useState } from "react";
import { X, Zap, Play, RotateCcw, Settings, Trophy, Star } from "lucide-react";
import FlashCardQuiz from "@/Components/Quiz/FlashCardQuiz";
import {
    OPERATION_MODES,
    SPEED_PRESETS,
    MIN_DIGITS,
    MAX_DIGITS,
    DEFAULT_ROUND_COUNT,
    numbersPerRoundOptionsFor,
    generateMentalAcceleratorSessions,
} from "./mentalAcceleratorSessions";

// Practice run phases.
const PHASE = {
    SETUP: "setup",
    PLAYING: "playing",
    DONE: "done",
};

const DEFAULT_SPEED = "easy";
const DEFAULT_OPERATION = OPERATION_MODES.MIXED;
const DEFAULT_MIN_DIGITS = 1;
const DEFAULT_MAX_DIGITS = 1;
const DEFAULT_NUMBERS_PER_ROUND = 5;

// Operation choices shown as big, kid-friendly symbols.
const OPERATION_CHOICES = [
    { key: OPERATION_MODES.ADDITION, symbol: "＋", label: "Add" },
    { key: OPERATION_MODES.SUBTRACTION, symbol: "－", label: "Subtract" },
    { key: OPERATION_MODES.MIXED, symbol: "±", label: "Mixed" },
];

// Selectable digit sizes (1..10).
const DIGIT_OPTIONS = Array.from(
    { length: MAX_DIGITS - MIN_DIGITS + 1 },
    (_, index) => MIN_DIGITS + index
);

/**
 * MentalAccelerator - Kid-friendly Flash Anzan practice tool.
 *
 * Numbers flash one-by-one; the child adds/subtracts them mentally and enters
 * the final total. The child picks the operation (add / subtract / mixed), the
 * number size (by digit count, optionally a mixed range), the speed and how
 * many numbers per round. The number sequence is never revealed at the end —
 * only the answer is asked for.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {Function} props.onClose - Called to close the modal.
 */
export default function MentalAccelerator({ isOpen, onClose }) {
    const [phase, setPhase] = useState(PHASE.SETUP);
    const [operation, setOperation] = useState(DEFAULT_OPERATION);
    const [speed, setSpeed] = useState(DEFAULT_SPEED);
    const [minDigits, setMinDigits] = useState(DEFAULT_MIN_DIGITS);
    const [maxDigits, setMaxDigits] = useState(DEFAULT_MAX_DIGITS);
    const [numbersPerRound, setNumbersPerRound] = useState(DEFAULT_NUMBERS_PER_ROUND);
    const [sessions, setSessions] = useState([]);
    const [results, setResults] = useState([]);

    // The numbers-per-round options depend on the operation and digit range:
    // single-digit add/subtract-only rounds allow fewer numbers (see helper).
    const numbersPerRoundOptions = useMemo(
        () => numbersPerRoundOptionsFor(operation, minDigits, maxDigits),
        [operation, minDigits, maxDigits]
    );

    if (!isOpen) {
        return null;
    }

    // Build a fresh set of rounds and start playing.
    const startRun = () => {
        setSessions(
            generateMentalAcceleratorSessions({
                operation,
                minDigits,
                maxDigits,
                displayTime: SPEED_PRESETS[speed].displayTime,
                numbersPerRound,
                roundCount: DEFAULT_ROUND_COUNT,
            })
        );
        setResults([]);
        setPhase(PHASE.PLAYING);
    };

    // FlashCardQuiz finished all rounds.
    const handleComplete = (roundResults) => {
        setResults(roundResults);
        setPhase(PHASE.DONE);
    };

    // Child chose "skip all" inside the quiz — return to setup.
    const handleSkip = () => setPhase(PHASE.SETUP);
    const backToSetup = () => setPhase(PHASE.SETUP);

    // Close the modal and reset the run so reopening always starts fresh at the
    // setup screen (the modal stays mounted while hidden, so state would persist
    // otherwise).
    const closeAndReset = () => {
        setPhase(PHASE.SETUP);
        setSessions([]);
        setResults([]);
        onClose();
    };

    // Keep the chosen numbers-per-round within the options valid for the given
    // operation and digit range, falling back to the largest still-valid option.
    const clampNumbersPerRound = (nextOperation, nextMinDigits, nextMaxDigits) => {
        const options = numbersPerRoundOptionsFor(nextOperation, nextMinDigits, nextMaxDigits);
        setNumbersPerRound((current) =>
            options.includes(current) ? current : options[options.length - 1]
        );
    };

    // Change the operation and re-validate the numbers-per-round selection.
    const handleOperation = (nextOperation) => {
        setOperation(nextOperation);
        clampNumbersPerRound(nextOperation, minDigits, maxDigits);
    };

    // Keep the digit range valid: smallest never exceeds largest. The
    // numbers-per-round selection is re-validated against the new range.
    const handleMinDigits = (value) => {
        setMinDigits(value);
        const nextMaxDigits = value > maxDigits ? value : maxDigits;
        if (value > maxDigits) {
            setMaxDigits(value);
        }
        clampNumbersPerRound(operation, value, nextMaxDigits);
    };
    const handleMaxDigits = (value) => {
        setMaxDigits(value);
        const nextMinDigits = value < minDigits ? value : minDigits;
        if (value < minDigits) {
            setMinDigits(value);
        }
        clampNumbersPerRound(operation, nextMinDigits, value);
    };

    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-aba-ink/60 p-3 backdrop-blur-sm sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Mental Accelerator practice"
        >
            <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-aba-lg bg-aba-surface shadow-2xl">
                <ModalHeader onClose={closeAndReset} />

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-8 sm:py-6">
                    {phase === PHASE.SETUP && (
                        <SetupScreen
                            operation={operation}
                            setOperation={handleOperation}
                            speed={speed}
                            setSpeed={setSpeed}
                            minDigits={minDigits}
                            maxDigits={maxDigits}
                            onMinDigits={handleMinDigits}
                            onMaxDigits={handleMaxDigits}
                            numbersPerRound={numbersPerRound}
                            setNumbersPerRound={setNumbersPerRound}
                            numbersPerRoundOptions={numbersPerRoundOptions}
                            onStart={startRun}
                        />
                    )}

                    {phase === PHASE.PLAYING && (
                        <FlashCardQuiz
                            sessions={sessions}
                            onComplete={handleComplete}
                            onSkip={handleSkip}
                            showSequenceRecap={false}
                        />
                    )}

                    {phase === PHASE.DONE && (
                        <ResultsScreen
                            results={results}
                            onPlayAgain={startRun}
                            onChangeSettings={backToSetup}
                            onClose={closeAndReset}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * ModalHeader - Branded header bar with a close button.
 */
function ModalHeader({ onClose }) {
    return (
        <div className="flex items-center justify-between border-b border-aba-line bg-aba-coral-soft px-5 py-4 sm:px-8">
            <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-aba-sm bg-aba-coral text-white shadow-aba-coral">
                    <Zap className="h-5 w-5 fill-current" />
                </span>
                <div>
                    <h2 className="font-display text-xl font-black text-aba-ink">Mental Accelerator</h2>
                    <p className="text-xs font-bold text-aba-coral-dark">Flash the numbers, add them in your head!</p>
                </div>
            </div>
            <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-aba-surface text-aba-ink-soft transition hover:text-aba-coral"
            >
                <X className="h-5 w-5" />
            </button>
        </div>
    );
}

/**
 * SetupScreen - Operation, number size, speed and round-length pickers.
 */
function SetupScreen({
    operation,
    setOperation,
    speed,
    setSpeed,
    minDigits,
    maxDigits,
    onMinDigits,
    onMaxDigits,
    numbersPerRound,
    setNumbersPerRound,
    numbersPerRoundOptions,
    onStart,
}) {
    // Live example numbers so the child sees how big the numbers will be.
    // Regenerated whenever the digit range changes.
    const exampleNumbers = useMemo(
        () => sampleNumbers(minDigits, maxDigits, 3),
        [minDigits, maxDigits]
    );

    const isMixedSize = minDigits !== maxDigits;

    return (
        <div className="py-2">
            <div className="text-center">
                <h3 className="font-display text-2xl font-black text-aba-ink">Set up your practice</h3>
                <p className="mt-1 text-sm font-semibold text-aba-ink-soft">
                    Numbers flash one at a time. Work them out in your head, then type the total.
                </p>
            </div>

            {/* Operation */}
            <Fieldset legend="What to practice">
                <div className="grid grid-cols-3 gap-3">
                    {OPERATION_CHOICES.map((choice) => (
                        <OptionButton
                            key={choice.key}
                            active={operation === choice.key}
                            activeClass="border-aba-coral bg-aba-coral-soft"
                            onClick={() => setOperation(choice.key)}
                        >
                            <span className="font-display text-3xl font-black leading-none text-aba-ink">{choice.symbol}</span>
                            <span className="font-display text-sm font-black text-aba-ink">{choice.label}</span>
                        </OptionButton>
                    ))}
                </div>
            </Fieldset>

            {/* Number size (digits) */}
            <Fieldset legend="Number size">
                <div className="flex flex-wrap items-end gap-4">
                    <DigitSelect
                        id="ma-min-digits"
                        label="Smallest"
                        value={minDigits}
                        onChange={onMinDigits}
                        from={MIN_DIGITS}
                        to={maxDigits}
                    />
                    <span className="pb-2.5 text-sm font-black text-aba-ink-soft">to</span>
                    <DigitSelect
                        id="ma-max-digits"
                        label="Biggest"
                        value={maxDigits}
                        onChange={onMaxDigits}
                        from={minDigits}
                        to={MAX_DIGITS}
                    />
                </div>
                <p className="mt-3 rounded-aba-sm bg-aba-surface-alt px-3 py-2 text-sm font-bold text-aba-ink-soft">
                    {isMixedSize ? "Mixed sizes · e.g. " : "e.g. "}
                    <span className="text-aba-ink">{exampleNumbers.join(" · ")}</span>
                </p>
            </Fieldset>

            {/* Speed */}
            <Fieldset legend="Speed">
                <div className="grid grid-cols-3 gap-3">
                    {Object.values(SPEED_PRESETS).map((preset) => (
                        <OptionButton
                            key={preset.key}
                            active={speed === preset.key}
                            activeClass="border-aba-coral bg-aba-coral-soft"
                            onClick={() => setSpeed(preset.key)}
                        >
                            <span className="text-3xl">{preset.emoji}</span>
                            <span className="font-display text-base font-black text-aba-ink">{preset.label}</span>
                            <span className="text-[11px] font-bold text-aba-ink-soft">{preset.displayTime}s each</span>
                        </OptionButton>
                    ))}
                </div>
            </Fieldset>

            {/* Numbers per round */}
            <Fieldset legend="How many numbers per round">
                <div className="grid grid-cols-4 gap-3">
                    {numbersPerRoundOptions.map((count) => (
                        <OptionButton
                            key={count}
                            active={numbersPerRound === count}
                            activeClass="border-aba-blue bg-aba-blue-soft"
                            onClick={() => setNumbersPerRound(count)}
                        >
                            <span className="font-display text-lg font-black text-aba-ink">{count}</span>
                        </OptionButton>
                    ))}
                </div>
            </Fieldset>

            <p className="mt-5 text-center text-xs font-semibold text-aba-ink-faint">
                You'll play {DEFAULT_ROUND_COUNT} rounds. Ready?
            </p>

            <button
                type="button"
                onClick={onStart}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-aba-sm bg-aba-coral px-6 py-3.5 font-display text-lg font-black text-white shadow-aba-coral transition hover:bg-aba-coral-dark focus:outline-none focus:ring-2 focus:ring-aba-coral focus:ring-offset-2"
            >
                <Play className="h-5 w-5 fill-current" /> Start Practice
            </button>
        </div>
    );
}

/**
 * Fieldset - Labelled group used for each setup section.
 */
function Fieldset({ legend, children }) {
    return (
        <fieldset className="mt-6">
            <legend className="mb-2 text-xs font-black uppercase tracking-wide text-aba-ink-soft">{legend}</legend>
            {children}
        </fieldset>
    );
}

/**
 * OptionButton - A selectable pill/card used across the setup sections.
 */
function OptionButton({ active, activeClass, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`flex flex-col items-center justify-center gap-1 rounded-aba-md border-2 px-3 py-3 transition ${
                active ? activeClass : "border-aba-line bg-aba-surface hover:border-aba-coral"
            }`}
        >
            {children}
        </button>
    );
}

/**
 * DigitSelect - Dropdown to pick a digit count for the number size.
 *
 * Only offers values within [from, to] so the "Smallest" can never exceed the
 * "Biggest" (and vice versa) — an inverted range can't be chosen.
 */
function DigitSelect({ id, label, value, onChange, from, to }) {
    const options = DIGIT_OPTIONS.filter((digits) => digits >= from && digits <= to);

    return (
        <label htmlFor={id} className="flex flex-col gap-1">
            <span className="text-[11px] font-black uppercase tracking-wide text-aba-ink-faint">{label}</span>
            <select
                id={id}
                value={value}
                onChange={(event) => onChange(Number(event.target.value))}
                className="rounded-aba-sm border-2 border-aba-line bg-aba-surface px-3 py-2 text-sm font-black text-aba-ink focus:border-aba-coral focus:outline-none"
            >
                {options.map((digits) => (
                    <option key={digits} value={digits}>
                        {digits} {digits === 1 ? "digit" : "digits"}
                    </option>
                ))}
            </select>
        </label>
    );
}

/**
 * ResultsScreen - Encouraging summary after a run, with replay options.
 */
function ResultsScreen({ results, onPlayAgain, onChangeSettings, onClose }) {
    const total = results.length;
    const correct = results.filter((result) => result.is_correct).length;
    const allCorrect = total > 0 && correct === total;
    // Every round was missed — show an encouraging "try again" message instead
    // of praising work that didn't land.
    const allWrong = total > 0 && correct === 0;

    // Pick the heading that matches how the run went.
    const heading = allCorrect
        ? "Perfect run! 🎉"
        : allWrong
        ? "Keep practicing — you've got this! 🌱"
        : "Nice work! 💪";

    return (
        <div className="py-6 text-center">
            <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-aba-yellow-soft text-aba-yellow">
                {allCorrect ? <Trophy className="h-8 w-8" /> : <Star className="h-8 w-8" />}
            </span>
            <h3 className="font-display text-2xl font-black text-aba-ink">
                {heading}
            </h3>
            <p className="mt-1 text-sm font-semibold text-aba-ink-soft">
                You got <span className="font-black text-aba-green">{correct}</span> of {total} rounds correct.
            </p>

            {/* Per-round recap (answer only, never the number sequence) */}
            <div className="mx-auto mt-5 max-w-sm space-y-2">
                {results.map((result, index) => (
                    <div
                        key={result.session_id ?? index}
                        className={`flex items-center justify-between rounded-aba-sm border px-4 py-2.5 text-sm ${
                            result.is_correct
                                ? "border-aba-green-soft bg-aba-green-soft"
                                : "border-aba-coral-soft bg-aba-coral-soft"
                        }`}
                    >
                        <span className="font-black text-aba-ink">Round {index + 1}</span>
                        <span className="font-semibold text-aba-ink-soft">
                            Your answer: <span className="font-black text-aba-ink">{formatAnswer(result.user_answer)}</span>
                            {!result.is_correct && (
                                <span className="ml-2 text-aba-coral-dark">(correct: {result.correct_answer})</span>
                            )}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <button
                    type="button"
                    onClick={onPlayAgain}
                    className="inline-flex items-center justify-center gap-2 rounded-aba-sm bg-aba-coral px-5 py-3 font-black text-white shadow-aba-coral transition hover:bg-aba-coral-dark"
                >
                    <RotateCcw className="h-4 w-4" /> Play Again
                </button>
                <button
                    type="button"
                    onClick={onChangeSettings}
                    className="inline-flex items-center justify-center gap-2 rounded-aba-sm border border-aba-line bg-aba-surface px-5 py-3 font-black text-aba-ink transition hover:border-aba-blue hover:text-aba-blue"
                >
                    <Settings className="h-4 w-4" /> Change Settings
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center justify-center rounded-aba-sm px-5 py-3 font-black text-aba-ink-soft transition hover:text-aba-ink"
                >
                    Done
                </button>
            </div>
        </div>
    );
}

/**
 * Generates a few example numbers within the given digit range, for the setup
 * preview. Uses the same digit-size rule as the session generator.
 *
 * @param {number} minDigits - Smallest number size.
 * @param {number} maxDigits - Largest number size.
 * @param {number} count - How many examples to produce.
 * @returns {number[]} Example numbers.
 */
function sampleNumbers(minDigits, maxDigits, count) {
    const low = Math.min(minDigits, maxDigits);
    const high = Math.max(minDigits, maxDigits);

    return Array.from({ length: count }, () => {
        const digits = Math.floor(Math.random() * (high - low + 1)) + low;
        const min = digits === 1 ? 1 : 10 ** (digits - 1);
        const max = 10 ** digits - 1;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    });
}

/**
 * Formats a possibly-null user answer for display.
 */
function formatAnswer(value) {
    if (value === null || value === undefined) {
        return "—";
    }
    return value;
}
