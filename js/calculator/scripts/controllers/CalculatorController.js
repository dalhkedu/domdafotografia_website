"use strict"

class CalculatorController {

    constructor() {

        this._lastOperator = "";
        this._lastNumber = "";
        this._operation = [];
        this._locale = "pt-BR";
        this._displayCalculatorEl = document.querySelector("#display");
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");
        this._currentDate = "";
        this.initialize();
        this.initButtonsEvents();
        this.initializeKeyboard();
    }

    copyToClipboard() {
        let input = document.createElement("input");
        input.value = this.displayCalculator;
        document.body.appendChild(input);
        input.select();
        document.execCommand("Copy");
        input.remove();
    }

    pasteFromClipboard() {
        document.addEventListener("paste", e => {
            let text = e.clipboardData.getData("Text");
            this.displayCalculator = parseFloat(text);
        });
        
    }

    initialize() {
 
        this.setDisplayDateTime(this._locale);
        setInterval(() => {
            this.setDisplayDateTime(this._locale);
        }, 1000);
        this.setLastNumberToDisplay();
        this.pasteFromClipboard();

    }

    initializeKeyboard() {
        document.addEventListener("keyup", e => {
            switch(e.key) {
                case "Escape":
                    this.clearAll();
                    break;
                case "Backspace":
                    this.clearEntry();
                    break;
                case "+":
                case "-":
                case "*":
                case "/":
                case "%":
                    this.additionalOperation(e.key);
                    break;
                case "Enter":
                case "=":
                    this.calculator();
                    break;
                case ".":
                case ",":
                    this.additionalDot();
                    break;  
                case "0":
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9":
                    this.additionalOperation(parseInt(e.key));
                    break;
                case "c":
                    if (e.ctrlKey) this.copyToClipboard();
                    break;
            }
        });
    }

    addEventListenerAll(element, events, fn) {
        events.split(" ").forEach(event => {
            element.addEventListener(event, fn, false);
        });

    }

    clearAll() {
        this._operation = [];
        this._lastNumber = "";
        this._lastOperator = "";
        this.setLastNumberToDisplay();
    }

    clearEntry() {
        this._operation.pop();
        this.setLastNumberToDisplay();
    }

    setError() {
        this.displayCalculator = "Error";
    }

    getLastOperation() {
        return this._operation[this._operation.length - 1];
    }

    setLastOperation(value) {
        this._operation[this._operation.length - 1] = value;
    }

    isOperator(value) {
        return (["+", "-", "*", "%", "/"].indexOf(value) > -1);
    }

    pushOperation(value) {
        this._operation.push(value);
        if (this._operation.length > 3) {
            this.calculator();
        }
    }

    getResult() {
        return eval(this._operation.join(""));
    }

    calculator() {
        let last = "";
        this._lastOperator = this.getLastItem();
        if (this._operation.length < 3) {
            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];
        }
        if (this._operation.length > 3) {
            last = this._operation.pop();
            this._lastNumber = this.getResult();
        } else if (this._operation.length == 3) {
            this._lastNumber = this.getLastItem(false);
        }
        let result = eval(this._operation.join(""))
        if (last == "%") {
            result /= 100;
        }
        this._operation = [result];
        if (last) this._operation.push(last);
        this.setLastNumberToDisplay();
    }

    getLastItem(isOperator = true) {
        let lastItem;

        for(let i = this._operation.length - 1; i >= 0; i--) {

            if (this.isOperator(this._operation[i]) == isOperator) {
                lastItem = this._operation[i];
                break;
            }
     
        }
        if (!lastItem) {
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
        }
        return lastItem;
    }

    setLastNumberToDisplay() {
        let lastNumber = this.getLastItem(false);
        if (!lastNumber) lastNumber = 0;
        this.displayCalculator = lastNumber;
    }

    additionalOperation(value) {
        if (isNaN(this.getLastOperation())) {
            if (this.isOperator(value)) {
                this.setLastOperation(value);
            } else {
                this.pushOperation(value);
                this.setLastNumberToDisplay();
            }
        } else {
            if (this.isOperator(value)) {
                this.pushOperation(value);
            } else {
                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue);
                this.setLastNumberToDisplay();
            }
            
        }
    }

    additionalDot() {
        let lastOperation = this.getLastOperation();
        if (typeof lastOperation === "string" && lastOperation.split("").indexOf(".") > -1) return;
        if (this.isOperator(lastOperation) || !lastOperation) {
            this.pushOperation("0.");
        } else {
            this.setLastOperation(lastOperation.toString() + ".");
        }
        this.setLastNumberToDisplay();
    }

    executionButton(button) {
        switch(button) {
            case "ac":
                this.clearAll();
                break;
            case "ce":
                this.clearEntry();
                break;
            case "soma":
                this.additionalOperation("+");
                break;
            case "subtracao":
                this.additionalOperation("-");
                break;
            case "divisao":
                this.additionalOperation("/");
                break;
            case "multiplicacao":
                this.additionalOperation("*");
                break;
            case "porcento":
                this.additionalOperation("%");
                break;
            case "igual":
                this.calculator();
                break;
            case "ponto":
                this.additionalDot();
                break;  
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
                this.additionalOperation(parseInt(button));
                break;
            default:
                this.setError();
                break;
        }
    }

    initButtonsEvents() {
        let buttons = document.querySelectorAll("#buttons > g, #parts > g");

        buttons.forEach(btn => {
            this.addEventListenerAll(btn, "click drag", e => {
                let textButton = btn.className.baseVal.replace("btn-", "");
                this.executionButton(textButton);
            });

            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => {
                btn.style.cursor = "pointer";
            });
        });
    }

    setDisplayDateTime(locale) {
        this.displayDate = this.currentDate.toLocaleDateString(locale);
        this.displayTime = this.currentDate.toLocaleTimeString(locale);
    }

    get displayTime() {
        return this._timeEl.innerHTML;
    }

    set displayTime(numberValue) {
        this._timeEl.innerHTML = numberValue;
    }

    get displayDate() {
        return this._dateEl.innerHTML;
    }

    set displayDate(numberValue) {
        this._dateEl.innerHTML = numberValue;
    }

    get displayCalculator() {
        return this._displayCalculatorEl.innerHTML;
    }

    set displayCalculator(numberValue) {
        this._displayCalculatorEl.innerHTML = numberValue
    }

    get currentDate() {
        return new Date();
    }

    set currentDate(numberValue) {
        this._currentDate = numberValue;
    }

}