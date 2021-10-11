function Validator(options) {
    var formRule = {}

    var formElement = document.querySelector(options.formSelector)
    
    options.rules.forEach(function(rule) {
   
        // Lập object với key là selector - value là các rule của selector đó
        if(Array.isArray(formRule[rule.selector])) {
            formRule[rule.selector].push(rule.test)
        } else {
            formRule[rule.selector] = [rule.test]
        }

        var inputElements = formElement.querySelectorAll(rule.selector)

        for(var inputElement of inputElements) {
            inputElement.onblur = function() {
                Validate(inputElement, rule)
            }
    
            inputElement.oninput = function() {
                var formGroupElement = inputElement.closest(options.formGroupSelector)
                var errorElement = formGroupElement.querySelector(options.errorSelector)
    
                errorElement.innerText = ''
                formGroupElement.classList.remove('invalid')
            }
        }
        


    })


    // Validate input
    function Validate(inputElement, rule) {
        var errorMessage
        var formGroupElement = inputElement.closest(options.formGroupSelector)
        var errorElement = formGroupElement.querySelector(options.errorSelector)

        var rules = formRule[rule.selector]
        for (var i = 0; i < rules.length ; i++) {
            switch(inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'))
                    break
                default:
                    errorMessage = rules[i](inputElement.value)
            }
            if (errorMessage) break
        }
        
        if (errorMessage) {
            errorElement.innerText = errorMessage
            formGroupElement.classList.add('invalid')
        } else {
            errorElement.innerText = ''
            formGroupElement.classList.remove('invalid')
        }
        return !errorMessage
    }

    // Xử lý onsubmit
    if (formElement) {
        formElement.onsubmit = function(e) {
            e.preventDefault()
            var isValid = true

            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector)

                var isRealValid = Validate(inputElement,rule)
                if (!isRealValid) {
                    isValid = false
                }
            })

            if (isValid) {
                if(typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]')

                    var formValue = Array.from(enableInputs).reduce(function(value, input) {
                        switch(input.type) {
                            case 'radio':
                                if(input.matches(':checked')) {
                                    value[input.name] = input.value
                                } else if (!value[input.name]) {
                                    value[input.name] = ''
                                }
                                break
                            case 'checkbox':
                                if(input.matches(':checked')) {
                                    if(!Array.isArray(value[input.name])) {
                                        value[input.name] = []
                                    }
                                    value[input.name].push(input.value)
                                } else if (!value[input.name]) {
                                    value[input.name] = ''
                                }
                                break
                            case 'file':
                                value[input.name] = input.files
                                break
                            default:
                                value[input.name] = input.value
                        }
                        return value
                    }, {})

                    options.onSubmit(formValue)
                } else {
                    formElement.submit()
                }
            }

        }
    }

}




// Rules

Validator.required = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            return value ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function(selector) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : 'Vui lòng nhập email cho trường này'
        }
    }
}

Validator.minLength = function(selector, min) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`
        }
    }
}

Validator.confirmed = function(selector, getConFirmed, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConFirmed() ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}