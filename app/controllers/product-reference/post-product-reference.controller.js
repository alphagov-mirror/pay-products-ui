'use strict'

const index = require('./get-product-reference.controller')
const adhocPaymentCtrl = require('../adhoc-payment')
const { setSessionVariable } = require('../../utils/cookie')
const { isNaxsiSafe } = require('../../browsered/field-validation-checks')

module.exports = (req, res) => {
  const product = req.product
  if (product.referenceNumber) {
    req.referenceNumber = product.referenceNumber
    return adhocPaymentCtrl.index(req, res)
  }

  const referenceNumber = req.body['payment-reference']
  if (!referenceNumber || referenceNumber.trim() === '') {
    req.errorMessage = `<h2 class="govuk-heading-m govuk-!-margin-bottom-0">${res.locals.__p('fieldValidation.generic').replace('%s', product.reference_label)}</h2>`
    return index(req, res)
  }
  if (referenceNumber.trim().length > 50) {
    req.errorMessage = `<h2 class="govuk-heading-m govuk-!-margin-bottom-0">${res.locals.__p('fieldValidation.isGreaterThanMaxLengthChars')}</h2>`
    return index(req, res)
  }
  const invalidCharactersError = isNaxsiSafe(referenceNumber, res.locals.__p('fieldValidation.invalidCharacters'))
  if (invalidCharactersError) {
    req.errorMessage = `<h2 class="govuk-heading-m govuk-!-margin-bottom-0">${invalidCharactersError}</h2>`
    return index(req, res)
  }
  setSessionVariable(req, 'referenceNumber', referenceNumber)
  return adhocPaymentCtrl.index(req, res)
}
