import Route from '@ioc:Adonis/Core/Route'

Route.get('/signup',  'AuthController.signupShow').as('auth.signup.show')
Route.post('/signup', 'AuthController.signup').as('auth.signup').middleware(['honeypot'])
Route.get('/signin',  'AuthController.signinShow').as('auth.signin.show')
Route.post('/signin', 'AuthController.signin').as('auth.signin')//.middleware(['honeypot'])
Route.get('/signout', 'AuthController.signout').as('auth.signout')

// AUTH - Redirect from old
Route.on('/login').redirectToPath('/signin')
Route.on('/register').redirectToPath('/signup')

Route.get('/:provider/redirect', 'AuthSocialController.redirect').as('auth.social.redirect');
Route.get('/:provider/callback', 'AuthSocialController.callback').as('auth.social.callback');
Route.get('/:provider/unlink',   'AuthSocialController.unlink').as('auth.social.unlink')

Route.get('/forgot-password',       'PasswordResetController.forgotPassword').as('auth.password.forgot');
Route.get('/forgot-password/sent',  'PasswordResetController.forgotPasswordSent').as('auth.password.forgot.sent');
Route.post('/forgot-password',      'PasswordResetController.forgotPasswordSend').as('auth.password.forgot.send')//.middleware(['honeypot']);
Route.get('/reset-password/:email', 'PasswordResetController.resetPassword').as('auth.password.reset');
Route.post('/reset-password',       'PasswordResetController.resetPasswordStore').as('auth.password.reset.store');