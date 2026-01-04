import { Form, Link } from '@adonisjs/inertia/react'
import { ReactElement } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from '~/components/ui/card'
import { Field, FieldError, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import AuthLayout from '~/layouts/auth'
import { Data } from '~generated/data'

function Signup() {
  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader>
        <CardTitle>Sign up</CardTitle>
        <CardDescription>
          Create your free account and start learning today!<br />
          Already have an account? <Link route="session.create" className="link">Sign in instead</Link>
        </CardDescription>
      </CardHeader>

      <Form route="session.store">
        {({ errors }) => (
          <CardPanel className="flex flex-col gap-3">
            <Field>
              <FieldLabel>Username</FieldLabel>
              <Input type="text" name="username" placeholder="Pick a username (displayed publicly)" />
              {errors.username && <FieldError>{errors.username}</FieldError>}
            </Field>

            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input type="email" name="email" placeholder="Enter your email" />
              {errors.email && <FieldError>{errors.email}</FieldError>}
            </Field>

            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input type="password" name="password" placeholder="Enter a secure password" />
              {errors.password && <FieldError>{errors.password}</FieldError>}
            </Field>

            <div className="mt-3">
              <Button type="submit" className="w-full">Sign up</Button>
            </div>
          </CardPanel>
        )}
      </Form>
    </Card>
  )
}

Signup.layout = (page: ReactElement<Data.SharedProps>) => <AuthLayout children={page} />

export default Signup