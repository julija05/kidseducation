/**
 * Client-side generator for Mental Accelerator (Flash Anzan) practice sessions.
 *
 * Produces the session shape consumed by the shared <FlashCardQuiz> component,
 * so practice runs render with the same flashing-number engine as quizzes.
 * Kept purely client-side because practice runs are not scored or persisted.
 *
 * Core kid-friendly guarantees, enforced at EVERY step (not just the final
 * answer):
 *   - the running total never goes below zero, and
 *   - the running total never exceeds the largest chosen number size
 *     (e.g. 1-2 digits => the total is always <= 99).
 */

// Operation modes the child can pick.
export const OPERATION_MODES = {
    ADDITION: "addition",
    SUBTRACTION: "subtraction",
    MIXED: "mixed",
};

// Speed presets control only how long each number flashes on screen.
export const SPEED_PRESETS = {
    easy: { key: "easy", label: "Easy", emoji: "🐢", displayTime: 2 },
    medium: { key: "medium", label: "Medium", emoji: "🐰", displayTime: 1.3 },
    fast: { key: "fast", label: "Fast", emoji: "⚡", displayTime: 0.8 },
};

// Number size is expressed in digits: 1 digit = 1..9, 2 digits = 10..99, etc.
export const MIN_DIGITS = 1;
export const MAX_DIGITS = 10;

// How many numbers flash per round (a "round" is one FlashCardQuiz session).
export const NUMBERS_PER_ROUND_OPTIONS = [3, 5, 7, 10];

// With single-digit numbers the running total can never exceed 9, so an
// addition- or subtraction-only round can only fit a few numbers before it
// would run out of room. These rounds are therefore limited to 3 or 5 numbers.
// Mixed rounds bounce up and down within [0, 9], so they keep the full range.
export const SINGLE_DIGIT_SINGLE_DIRECTION_OPTIONS = [3, 5];

/**
 * Returns the numbers-per-round options available for the chosen operation and
 * digit range.
 *
 * When only single-digit numbers are used (smallest and biggest are both 1
 * digit) an addition- or subtraction-only round is limited to 3 or 5 numbers,
 * because a single-digit total caps at 9 and cannot absorb more. Mixed rounds
 * and every larger digit size keep the full set of options (up to 10).
 *
 * @param {string} operation - One of OPERATION_MODES.
 * @param {number} minDigits - Smallest number size (digits).
 * @param {number} maxDigits - Largest number size (digits).
 * @returns {number[]} The selectable numbers-per-round options.
 */
export function numbersPerRoundOptionsFor(operation, minDigits, maxDigits) {
    const isSingleDigitOnly = minDigits === 1 && maxDigits === 1;
    const isSingleDirection =
        operation === OPERATION_MODES.ADDITION ||
        operation === OPERATION_MODES.SUBTRACTION;

    if (isSingleDigitOnly && isSingleDirection) {
        return SINGLE_DIGIT_SINGLE_DIRECTION_OPTIONS;
    }

    return NUMBERS_PER_ROUND_OPTIONS;
}

// Number of rounds played in one practice run.
export const DEFAULT_ROUND_COUNT = 3;

// In mixed mode, how often subtraction is chosen (when both stay in-bounds).
const SUBTRACTION_CHANCE = 0.5;

/**
 * Returns a random integer between min and max (inclusive).
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Computes the value bounds implied by a digit range.
 *
 * @param {number} minDigits - Smallest number size (digits).
 * @param {number} maxDigits - Largest number size (digits).
 * @returns {{ minSized: number, maxSized: number, maxValue: number }}
 *   minSized/maxSized are the smallest/largest allowed individual numbers;
 *   maxValue is the hard cap the running total must never exceed.
 */
function boundsForDigits(minDigits, maxDigits) {
    const minSized = minDigits === 1 ? 1 : 10 ** (minDigits - 1);
    const maxSized = 10 ** maxDigits - 1;
    return { minSized, maxSized, maxValue: maxSized };
}

/**
 * Builds an addition-only round: every number is added and the running total
 * is kept at or below maxValue by reserving room for the numbers still to come.
 */
function buildAdditionRound({ minSized, maxSized, maxValue, count }) {
    const numbers = [];
    let total = 0;

    for (let index = 0; index < count; index++) {
        const numbersLeft = count - index;
        const reserveForRest = (numbersLeft - 1) * minSized;
        const upper = Math.min(maxSized, maxValue - total - reserveForRest);

        // When the digit range simply cannot fit this many numbers under the
        // cap (e.g. ten 1-digit numbers, which must stay <= 9), fall back to the
        // smallest allowed number. This only occurs in impossible combinations.
        const value = upper < minSized ? minSized : randomInt(minSized, upper);

        total += value;
        numbers.push(value);
    }

    return { numbers, total };
}

/**
 * Builds a subtraction-only round. Subtrahends are chosen first (summing to at
 * most maxValue), then a starting number is picked at least as large as their
 * sum, so the total starts in-bounds and steps down without going negative.
 */
function buildSubtractionRound({ minSized, maxSized, maxValue, count }) {
    const subtrahendCount = count - 1;
    const subtrahends = [];
    let remainingBudget = maxValue;

    for (let index = 0; index < subtrahendCount; index++) {
        const subtrahendsLeft = subtrahendCount - index;
        const reserveForRest = (subtrahendsLeft - 1) * minSized;
        const upper = Math.min(maxSized, remainingBudget - reserveForRest);

        const value = upper < minSized ? minSized : randomInt(minSized, upper);

        remainingBudget -= value;
        subtrahends.push(value);
    }

    const subtrahendSum = subtrahends.reduce((sum, value) => sum + value, 0);
    // Start no smaller than the sum (keeps the total >= 0) and no larger than
    // the cap (keeps every step within the chosen digit size).
    const startingNumber = randomInt(Math.min(subtrahendSum, maxValue), maxValue);

    return {
        numbers: [startingNumber, ...subtrahends.map((value) => -value)],
        total: startingNumber - subtrahendSum,
    };
}

/**
 * Builds a mixed round as a bounded random walk: at each step it adds or
 * subtracts a valid-sized number, only choosing a direction that keeps the
 * running total within [0, maxValue].
 */
function buildMixedRound({ minSized, maxSized, maxValue, count }) {
    const numbers = [];
    let total = randomInt(minSized, maxSized);
    numbers.push(total);

    for (let index = 1; index < count; index++) {
        const addRoom = maxValue - total;
        const subRoom = total;
        const canAdd = addRoom >= minSized;
        const canSub = subRoom >= minSized;

        let subtract;
        if (canAdd && canSub) {
            subtract = Math.random() < SUBTRACTION_CHANCE;
        } else if (canAdd) {
            subtract = false;
        } else if (canSub) {
            subtract = true;
        } else {
            // Neither direction fits a full-sized number (only possible in a
            // degenerate range); nudge by the smallest step that stays in-bounds.
            if (addRoom >= 1) {
                numbers.push(1);
                total += 1;
            } else if (subRoom >= 1) {
                numbers.push(-1);
                total -= 1;
            }
            continue;
        }

        if (subtract) {
            const value = randomInt(minSized, Math.min(maxSized, subRoom));
            numbers.push(-value);
            total -= value;
        } else {
            const value = randomInt(minSized, Math.min(maxSized, addRoom));
            numbers.push(value);
            total += value;
        }
    }

    return { numbers, total };
}

/**
 * Builds a human-readable operations sequence like "7 +3 -2".
 * (Not shown to the child during practice, but handy for debugging.)
 */
function buildOperationsSequence(numbers) {
    return numbers
        .map((num, index) => (index === 0 ? `${num}` : num >= 0 ? ` +${num}` : ` ${num}`))
        .join("");
}

/**
 * Builds a single round for the chosen operation mode.
 */
function buildRound({ operation, minSized, maxSized, maxValue, numbersPerRound }) {
    const shared = { minSized, maxSized, maxValue, count: numbersPerRound };

    if (operation === OPERATION_MODES.ADDITION) {
        return buildAdditionRound(shared);
    }
    if (operation === OPERATION_MODES.SUBTRACTION) {
        return buildSubtractionRound(shared);
    }
    return buildMixedRound(shared);
}

/**
 * Generates practice sessions for the Mental Accelerator.
 *
 * @param {Object} options
 * @param {string} options.operation - One of OPERATION_MODES.
 * @param {number} options.minDigits - Smallest number size (digits).
 * @param {number} options.maxDigits - Largest number size (digits).
 * @param {number} options.displayTime - Seconds each number is shown.
 * @param {number} options.numbersPerRound - How many numbers flash per round.
 * @param {number} [options.roundCount] - Number of rounds (defaults to DEFAULT_ROUND_COUNT).
 * @returns {Array} Sessions consumable by <FlashCardQuiz>.
 */
export function generateMentalAcceleratorSessions({
    operation,
    minDigits,
    maxDigits,
    displayTime,
    numbersPerRound,
    roundCount = DEFAULT_ROUND_COUNT,
}) {
    // Guard against an inverted range (largest smaller than smallest).
    const safeMinDigits = Math.min(minDigits, maxDigits);
    const safeMaxDigits = Math.max(minDigits, maxDigits);
    const { minSized, maxSized, maxValue } = boundsForDigits(safeMinDigits, safeMaxDigits);

    const sessions = [];

    for (let round = 0; round < roundCount; round++) {
        const { numbers, total } = buildRound({
            operation,
            minSized,
            maxSized,
            maxValue,
            numbersPerRound,
        });

        sessions.push({
            session_id: round + 1,
            numbers,
            display_time: displayTime,
            correct_answer: total,
            operations_sequence: buildOperationsSequence(numbers),
        });
    }

    return sessions;
}
