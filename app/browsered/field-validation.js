'use strict'

// NPM Dependencies
const every = require('lodash/every')

// Local Dependencies
const checks = require('./field-validation-checks')

// Global constants
const validationErrorsTemplate = require('../views/includes/validation-errors.njk')

exports.enableFieldValidation = function () {
  const allForms = Array.prototype.slice.call(document.getElementsByTagName('form'))

  allForms.filter(form => {
    return form.hasAttribute('data-validate')
  }).map(form => {
    form.addEventListener('submit', initValidation, false)
  })
}

function initValidation (e) {
  const form = e.target
  e.preventDefault()
  clearPreviousErrors()

  const validatedFields = findFields(form)
    .map(field => validateField(form, field))

  if (every(validatedFields)) {
    form.submit()
  } else {
    populateErrorSummary(form)
  }
}

function clearPreviousErrors () {
  const previousErrorsMessages = Array.prototype.slice.call(document.querySelectorAll('.govuk-error-message, .govuk-error-summary'))
  const previousErrorsFields = Array.prototype.slice.call(document.querySelectorAll('.govuk-form-group.govuk-form-group--error'))

  previousErrorsMessages.map(error => error.remove())
  previousErrorsFields.map(errorField => errorField.classList.remove('govuk-form-group--error'))
}

function findFields (form) {
  const formFields = Array.prototype.slice.call(form.querySelectorAll('input, textarea, select'))

  return formFields.filter(field => {
    return field.hasAttribute('data-validate')
  })
}

function validateField (form, field) {
  let result
  const validationTypes = field.getAttribute('data-validate').split(' ')

  validationTypes.forEach(validationType => {
    switch (validationType) {
      case 'currency' :
        result = checks.isCurrency(field.value, window.i18n.fieldValidation.currency)
        break
      case 'belowMaxAmount' :
        result = checks.isAboveMaxAmount(field.value, window.i18n.fieldValidation.isAboveMaxAmount)
        break
      case 'isNaxsiSafe':
        result = checks.isNaxsiSafe(field.value, window.i18n.fieldValidation.invalidCharacters)
        break
      default :
        result = checks.isEmpty(field.value, window.i18n.fieldValidation.required)
        break
    }
    if (result) {
      applyErrorMessaging(form, field, result)
    }
  })

  if (!result) {
    return true
  }
}

function applyErrorMessaging (form, field, result) {
  const formGroup = field.closest('.govuk-form-group')
  if (!formGroup.classList.contains('govuk-form-group--error')) {
    formGroup.classList.add('govuk-form-group--error')
    document.querySelector('label[for="' + field.name + '"]').insertAdjacentHTML('beforeend',
      '<span class="govuk-error-message">' + result + '</span>')
  }
}

function populateErrorSummary (form) {
  const erroringFields = Array.prototype.slice.call(form.querySelectorAll('.govuk-form-group--error label'))
  const configuration = {
    title: window.i18n.fieldValidation.summary,
    fields: erroringFields.map(field => {
      const label = field.innerHTML.split('<')[0].trim()
      const id = field.getAttribute('for')
      return { label, id }
    })
  }

  form.parentNode.insertAdjacentHTML(
    'afterbegin',
    validationErrorsTemplate(configuration)
  )
  window.scroll(0, 0)
}
