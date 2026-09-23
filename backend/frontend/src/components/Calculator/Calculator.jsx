import {
    useCallback,
    useEffect,
    useState,
} from "react";

import "./Calculator.css";


function Calculator({ onClose }) {

    const [display, setDisplay] = useState("0");
    const [expression, setExpression] = useState("");


    // ============================================================
    // APPEND VALUE
    // ============================================================

    const appendValue = useCallback((value) => {

        setDisplay((previous) => {

            if (
                previous === "0" &&
                value !== "."
            ) {
                return value;
            }

            return previous + value;
        });

    }, []);


    // ============================================================
    // CLEAR
    // ============================================================

    const clearCalculator = useCallback(() => {

        setDisplay("0");
        setExpression("");

    }, []);


    // ============================================================
    // DELETE
    // ============================================================

    const deleteLast = useCallback(() => {

        setDisplay((previous) => {

            if (
                previous === "Error" ||
                previous.length <= 1
            ) {
                return "0";
            }

            return previous.slice(0, -1);
        });

    }, []);


    // ============================================================
    // CALCULATE
    // ============================================================

    const calculate = useCallback(() => {

        try {

            const sanitized =
                display
                    .replace(/×/g, "*")
                    .replace(/÷/g, "/");


            if (
                !/^[0-9+\-*/%.()\s]+$/.test(
                    sanitized
                )
            ) {
                throw new Error(
                    "Invalid expression"
                );
            }


            const result = Function(
                `"use strict"; return (${sanitized})`
            )();


            if (
                !Number.isFinite(result)
            ) {
                throw new Error(
                    "Invalid result"
                );
            }


            setExpression(display);


            setDisplay(
                Number.isInteger(result)
                    ? String(result)
                    : String(
                        Number(
                            result.toFixed(10)
                        )
                    )
            );

        } catch (error) {

            console.error(
                "Calculator error:",
                error
            );

            setDisplay("Error");
        }

    }, [display]);


    // ============================================================
    // KEYBOARD
    // ============================================================

    const handleKeyDown = useCallback(
        (event) => {

            const key = event.key;


            // Numbers / decimal
            if (
                /^[0-9.]$/.test(key)
            ) {

                appendValue(key);

                return;
            }


            // Operators
            if (
                ["+", "-", "*", "/", "%"].includes(key)
            ) {

                appendValue(
                    key === "*"
                        ? "×"
                        : key
                );

                return;
            }


            // Calculate
            if (
                key === "Enter" ||
                key === "="
            ) {

                event.preventDefault();

                calculate();

                return;
            }


            // Backspace
            if (
                key === "Backspace"
            ) {

                deleteLast();

                return;
            }


            // Escape
            if (
                key === "Escape"
            ) {

                event.preventDefault();

                onClose?.();

            }

        },
        [
            appendValue,
            calculate,
            deleteLast,
            onClose,
        ]
    );


    // ============================================================
    // KEYBOARD LISTENER
    // ============================================================

    useEffect(() => {

        window.addEventListener(
            "keydown",
            handleKeyDown
        );


        return () => {

            window.removeEventListener(
                "keydown",
                handleKeyDown
            );

        };

    }, [handleKeyDown]);


    // ============================================================
    // BUTTON HELPER
    // ============================================================

    const button = (
        value,
        className = "",
        action = null
    ) => (

        <button
            type="button"

            className={
                `calculator-button ${className}`
            }

            onClick={() => {

                if (action) {

                    action();

                } else {

                    appendValue(value);

                }

            }}
        >
            {value}
        </button>

    );


    // ============================================================
    // UI
    // ============================================================

    return (

        <div
            className="calculator-overlay"

            onMouseDown={(event) => {

                // IMPORTANT:
                // Click directly on empty overlay
                // closes calculator.

                if (
                    event.target ===
                    event.currentTarget
                ) {

                    onClose?.();

                }

            }}
        >

            <div
                className="calculator-card"

                onMouseDown={(event) => {

                    // Calculator itself should
                    // NOT close.

                    event.stopPropagation();

                }}
            >

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="calculator-header">

                    <div className="calculator-title">

                        <span>
                            🧮
                        </span>

                        <span>
                            Garuda Calculator
                        </span>

                    </div>


                    <button
                        type="button"

                        className="calculator-close"

                        onClick={onClose}

                        aria-label="Close calculator"
                    >
                        ×
                    </button>

                </div>


                {/* ==================================================
                    DISPLAY
                ================================================== */}

                <div className="calculator-display">

                    {expression && (

                        <div className="calculator-expression">
                            {expression}
                        </div>

                    )}


                    <div className="calculator-result">
                        {display}
                    </div>

                </div>


                {/* ==================================================
                    BUTTON GRID
                ================================================== */}

                <div className="calculator-grid">

                    {button(
                        "AC",
                        "function-button",
                        clearCalculator
                    )}


                    {button(
                        "⌫",
                        "function-button",
                        deleteLast
                    )}


                    {button(
                        "%",
                        "operator-button"
                    )}


                    {button(
                        "÷",
                        "operator-button"
                    )}


                    {button("7")}
                    {button("8")}
                    {button("9")}

                    {button(
                        "×",
                        "operator-button"
                    )}


                    {button("4")}
                    {button("5")}
                    {button("6")}

                    {button(
                        "-",
                        "operator-button"
                    )}


                    {button("1")}
                    {button("2")}
                    {button("3")}

                    {button(
                        "+",
                        "operator-button"
                    )}


                    {button(
                        "0",
                        "zero-button"
                    )}

                    {button(".")}


                    {button(
                        "=",
                        "equals-button",
                        calculate
                    )}

                </div>

            </div>

        </div>

    );

}


export default Calculator;