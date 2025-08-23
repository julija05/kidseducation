import { Transition } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import { createContext, useContext, useState } from 'react';

const DropDownContext = createContext();

const Dropdown = ({ children }) => {
    const [open, setOpen] = useState(false);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div className="relative">{children}</div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({ children }) => {
    const { open, setOpen, toggleOpen } = useContext(DropDownContext);

    return (
        <>
            <div onClick={toggleOpen}>{children}</div>

            {open && (
                <div
                    className="fixed inset-0 bg-transparent"
                    onClick={() => setOpen(false)}
                    style={{ zIndex: 99998 }}
                ></div>
            )}
        </>
    );
};

const Content = ({
    align = 'right',
    width = '48',
    contentClasses = 'py-2 bg-white backdrop-blur-xl border border-gray-300 shadow-2xl',
    children,
}) => {
    const { open, setOpen } = useContext(DropDownContext);

    let alignmentClasses = 'origin-top';

    if (align === 'left') {
        alignmentClasses = 'ltr:origin-top-left rtl:origin-top-right start-0';
    } else if (align === 'right') {
        alignmentClasses = 'ltr:origin-top-right rtl:origin-top-left end-0';
    }

    let widthClasses = '';

    if (width === '48') {
        widthClasses = 'w-48';
    }

    return (
        <>
            <Transition
                show={open}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div
                    onClick={() => setOpen(false)}
                    className="fixed sm:absolute top-16 sm:top-full right-2 sm:right-0 left-2 sm:left-auto sm:mt-2 
                               min-w-0 sm:min-w-[320px] max-w-none sm:max-w-[380px] w-auto sm:w-[340px]
                               z-[99999] bg-white backdrop-blur-xl border-2 border-gray-300 
                               shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6),_0_0_0_1px_rgba(0,0,0,0.1)] 
                               rounded-xl sm:rounded-2xl overflow-visible"
                >
                    <div
                        className={
                            `rounded-xl ring-1 ring-gray-200 ring-opacity-50 ` +
                            contentClasses
                        }
                        onClick={(e) => e.stopPropagation()}
                    >
                        {children}
                    </div>
                </div>
            </Transition>
        </>
    );
};

const DropdownLink = ({ className = '', children, ...props }) => {
    return (
        <Link
            {...props}
            className={
                'block w-full px-4 py-4 text-start text-base leading-6 text-gray-800 font-medium transition duration-150 ease-in-out hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 focus:bg-blue-50 focus:outline-none hover:text-blue-700 hover:shadow-sm border-l-4 border-transparent hover:border-blue-400 touch-manipulation active:bg-blue-100 ' +
                className
            }
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
