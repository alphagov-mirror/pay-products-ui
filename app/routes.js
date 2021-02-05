'use strict'

// Local Dependencies
const response = require('./utils/response.js').response
const generateRoute = require('./utils/generate_route')
const paths = require('./paths.js')

// - Controllers
const staticCtrl = require('./controllers/static_controller')
const healthcheckCtrl = require('./controllers/healthcheck_controller')
const friendlyUrlRedirectCtrl = require('./controllers/friendly_url_redirect_controller')
const prePaymentCtrl = require('./controllers/pre_payment_controller')
const completeCtrl = require('./controllers/payment_complete_controller')
const failedCtrl = require('./controllers/demo_payment/payment_failed_controller')
const successCtrl = require('./controllers/demo_payment/payment_success_controller')
const adhocPaymentCtrl = require('./controllers/adhoc_payment')
const productReferenceCtrl = require('./controllers/product_reference')

// Middleware
const { validateAndRefreshCsrf, ensureSessionHasCsrfSecret } = require('./middleware/csrf')
const resolveProduct = require('./middleware/resolve_product')
const resolvePaymentAndProduct = require('./middleware/resolve_payment_and_product')
const resolveLanguage = require('./middleware/resolve-language')
// - Middleware
const correlationId = require('./middleware/correlation_id')

// Assignments
const { healthcheck, staticPaths, friendlyUrl, pay, demoPayment } = paths

// Exports
module.exports.generateRoute = generateRoute
module.exports.paths = paths

module.exports.bind = function (app) {
  app.get('/style-guide', (req, res) => response(req, res, 'style_guide'))

  // APPLY CORRELATION MIDDLEWARE
  app.use('*', correlationId)

  // HEALTHCHECK
  app.get(healthcheck.path, healthcheckCtrl)

  // STATIC
  app.all(staticPaths.naxsiError, staticCtrl.naxsiError)

  // FRIENDLY URL
  app.get(friendlyUrl.redirect, friendlyUrlRedirectCtrl)

  // CREATE PAYMENT
  app.get(pay.product, ensureSessionHasCsrfSecret, validateAndRefreshCsrf, resolveProduct, resolveLanguage, prePaymentCtrl)

  // CREATE REFERENCE
  app.get(pay.reference, ensureSessionHasCsrfSecret, validateAndRefreshCsrf, resolveProduct, resolveLanguage, prePaymentCtrl)
  app.post(pay.reference, ensureSessionHasCsrfSecret, validateAndRefreshCsrf, resolveProduct, resolveLanguage, productReferenceCtrl.postReference)

  // PAYMENT COMPLETE
  app.get(pay.complete, resolvePaymentAndProduct, resolveLanguage, completeCtrl)

  // DEMO SPECIFIC SCREENS
  app.get(demoPayment.failure, failedCtrl)
  app.get(demoPayment.success, successCtrl)

  // ADHOC AND AGENT_INITIATED_MOTO SPECIFIC SCREENS
  app.post(pay.product, ensureSessionHasCsrfSecret, validateAndRefreshCsrf, resolveProduct, resolveLanguage, adhocPaymentCtrl.postIndex)

  // route to gov.uk 404 page
  // this has to be the last route registered otherwise it will redirect other routes
  app.all('*', (req, res) => res.redirect('https://www.gov.uk/404'))
}
