import KeyboardLayout from '../keyboard-layout.json';

export default class Keyboard {
  constructor(input) {
    this.$el = null;
    this.input = {
      element: input,
      getElementInfo() {
        const out = {};

        out.cursorPosition = this.element.selectionStart;
        out.value = this.element.value;

        return out;
      },
      push(char) {
        const elementInfo = this.getElementInfo();
        const elementValue = elementInfo.value;
        const {cursorPosition} = elementInfo;

        this.element.value = elementValue.slice(0, cursorPosition) + char + elementValue.slice(cursorPosition);
        this.element.setSelectionRange(cursorPosition + 1, cursorPosition + 1);

        this.element.focus();
        this.element.dispatchEvent(new Event('keydown'));
      },
      removeChar() {
        const elementInfo = this.getElementInfo();
        const elementValue = elementInfo.value;
        const {cursorPosition} = elementInfo;

        if (!cursorPosition)
          return;

        this.element.value = elementValue.slice(0, cursorPosition - 1) + elementValue.slice(cursorPosition);
        this.element.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
        this.element.dispatchEvent(new Event('keydown'));
      },
      moveCursorLeft() {
        const cursorPosition = this.element.selectionStart - 1;

        this.element.setSelectionRange(cursorPosition, cursorPosition);
      },
      moveCursorRight() {
        const cursorPosition = this.element.selectionStart + 1;

        this.element.setSelectionRange(cursorPosition, cursorPosition);
      }
    }
    this.keyboardLayout = KeyboardLayout;

    this.classShow = 'show';
    this.classHide = 'hide';
    this.classWrapper = 'keyboard'
    this.classLine = 'keyboard__line';
    this.classButton = 'keyboard__line-button';
    this.classButtonWide = 'keyboard__line-button--wide';
    this.classButtonExtraWide = 'keyboard__line-button--extra-wide';
    this.classButtonText = 'keyboard__line-button-text';
    this.classButtonTextHide = 'keyboard__line-button-text--hide';
    this.classButtonTextShow = 'keyboard__line-button-text--show';

    this.eventChangeLanguage = 'changeLanguage';
    this.eventChangeRegistry = 'changeRegistry';

    this.currentLanguage = 'en';
    this.isShifted = false;
    this.isUppercase = false;

    this.highlightingButtons = {};

    this.keyboardCreate();
    this.setInputListeners();
  }

  keyboardCreate() {
    if (this.$el instanceof HTMLElement)
      return;

    this.buildKeyboardEntity();
  }

  keyboardShow() {
    this.$el.classList.add(this.classShow);
  }

  keyboardHide() {
    this.$el.classList.remove(this.classShow);
  }

  buildKeyboardEntity() {
    this.$el = document.createElement('div');

    this.$el.className = this.classWrapper;

    this.keyboardLayout.lines.forEach((line) => {
      this.$el.append(this.buildKeyboardLine(line));
    });

    document.body.append(this.$el);
  }

  buildKeyboardLine(lineConfig) {
    const line = document.createElement('div');

    line.className = this.classLine;

    lineConfig.forEach((button) => {
      line.append(this.buildKeyboardButton(button))
    });

    return line;
  }

  buildKeyboardButton(buttonConfig) {
    const button = document.createElement('div');
    const buttonText = document.createElement('span');

    button.className = `${this.classButton} key-${buttonConfig.keyCode}`;
    button.append(buttonText);

    buttonText.className = this.classButtonText;
    buttonText.innerText = this.getButtonChar(buttonConfig);


    if (buttonConfig.special)
      button.classList.add(this.classButtonWide);

    if (buttonConfig.special && buttonConfig.special === 'space')
      button.classList.add(this.classButtonExtraWide);


    const changeButtonChar = () => {
      const currentChar = button.innerText;
      const newChar = this.getButtonChar(buttonConfig);

      if (currentChar === newChar)
        return;

      buttonText.classList.add(this.classButtonTextHide)

      buttonText.ontransitionend = () => {
        buttonText.ontransitionend = null;
        buttonText.innerText = this.getButtonChar(buttonConfig);

        buttonText.classList.add(this.classButtonTextShow);
        buttonText.classList.remove(this.classButtonTextHide);
        setTimeout(buttonText.classList.remove.bind(buttonText.classList, this.classButtonTextShow), 0);
      };
    };

    this.$el.addEventListener(this.eventChangeLanguage, changeButtonChar);

    this.$el.addEventListener(this.eventChangeRegistry, changeButtonChar);

    button.addEventListener('click', this.handleButtonClick.bind(this, buttonConfig));

    return button;
  }

  setInputListeners() {
    this.input.element.addEventListener('focus', () => {
      this.keyboardShow();
    });

    this.input.element.addEventListener('keydown', (event) => {
      if (event instanceof KeyboardEvent) {
        this.highlightButtonByKeyCode(event.which);

        if ([16, 20].includes(event.which)) {
          event.preventDefault();

          if (event.which === 20) {
            this.toggleUppercase();
          } else if (event.which === 16) {
            this.toggleShift();
          }

          return;
        }

        if (event.which === 13) {
          this.keyboardHide();

          return;
        }

        if (event.ctrlKey)
          return;

        const char = this.getButtonCharByKeyCode(event.which);

        if (char) {
          this.input.push(char);

          event.preventDefault();
        }
      }
    })
  }

  getButtonChar(buttonConfig) {
    let symbolCategory;

    if (this.isShifted && buttonConfig.chars[this.currentLanguage].shift) {
      symbolCategory = 'shift';
    } else if (this.isShifted && this.isUppercase) {
      symbolCategory = 'normal';
    } else if (this.isUppercase || this.isShifted) {
      symbolCategory = 'uppercase';
    } else {
      symbolCategory = 'normal';
    }

    return buttonConfig.chars[this.currentLanguage][symbolCategory];
  }

  getButtonCharByKeyCode(keyCode) {
    let needleSymbol = '';

    KeyboardLayout.lines.forEach((line) => {
      line.forEach((buttonConfig) => {
        if (buttonConfig.keyCode === keyCode && !buttonConfig.special) {
          needleSymbol = this.getButtonChar(buttonConfig);
        }
      });
    });

    return needleSymbol;
  }

  highlightButtonByKeyCode(keyCode) {
    const element = this.$el.querySelector(`.key-${keyCode}`);

    if (!element)
      return;

    if (this.highlightingButtons[keyCode]) {
      clearTimeout(this.highlightingButtons[keyCode]);
      delete this.highlightingButtons[keyCode];
    }

    element.classList.add('highlight');
    this.highlightingButtons[keyCode] = setTimeout(() => {
      element.classList.remove('highlight');

      delete this.highlightingButtons[keyCode];
    }, 250);
  }

  handleButtonClick(buttonConfig) {
    if (buttonConfig.special) {
      if (buttonConfig.special === 'changeLanguage') {
        this.toggleLanguage();
      } else if (buttonConfig.special === 'capslock') {
        this.toggleUppercase();
      } else if (buttonConfig.special === 'shift') {
        this.toggleShift();
      } else if (buttonConfig.special === 'space') {
        this.input.push(' ');
      } else if (buttonConfig.special === 'backspace') {
        this.input.removeChar();
      } else if (buttonConfig.special === 'enter') {
        this.keyboardHide();

        return;
      } else if (buttonConfig.special === 'close') {
        this.keyboardHide();
      } else if (buttonConfig.special === 'arrow-left') {
        this.input.moveCursorLeft();
      } else if (buttonConfig.special === 'arrow-right') {
        this.input.moveCursorRight();
      }

      if (buttonConfig.special !== 'close')
        this.input.element.focus();
    } else {
      this.input.push(this.getButtonChar(buttonConfig));
    }
  }

  toggleLanguage() {
    this.currentLanguage = (this.currentLanguage === 'ru') ? 'en' : 'ru';

    this.$el.dispatchEvent(new Event(this.eventChangeLanguage));
  }

  toggleUppercase() {
    this.isUppercase = !this.isUppercase;
    this.$el.classList[(this.isUppercase) ? 'add' : 'remove']('uppercase');

    this.$el.dispatchEvent(new Event(this.eventChangeRegistry));
  }

  toggleShift() {
    this.isShifted = !this.isShifted;
    this.$el.classList[(this.isShifted) ? 'add' : 'remove']('shifted');

    this.$el.dispatchEvent(new Event(this.eventChangeRegistry));
  }
}