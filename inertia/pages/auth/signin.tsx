import { Form, Link } from '@adonisjs/inertia/react'
import AuthShell from '~/components/auth_shell'
import { Button } from '~/components/ui/button'
import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from '~/components/ui/card'
import { Field, FieldError, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'

export default function Login() {
  return (
    <AuthShell>
      <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Enter your email and password to sign in.
            <br />
            Need an account?{' '}
            <Link route="new_account.create" className="link">
              Sign up instead
            </Link>
          </CardDescription>
        </CardHeader>

        <Form route="session.store">
          {({ errors }) => (
            <CardPanel className="flex flex-col gap-3">
              <Field>
                <FieldLabel>Username/email</FieldLabel>
                <Input type="text" name="uid" placeholder="Enter your username or email" />
                {errors.uid && <FieldError>{errors.uid}</FieldError>}
              </Field>

              <Field>
                <FieldLabel>Password</FieldLabel>
                <Input type="password" name="password" placeholder="Enter your password" />
                {errors.password && <FieldError>{errors.password}</FieldError>}
              </Field>

              <div className="mt-3">
                <Button type="submit" className="w-full">
                  Sign in
                </Button>
              </div>
            </CardPanel>
          )}
        </Form>
      </Card>
    </AuthShell>
  )
}
