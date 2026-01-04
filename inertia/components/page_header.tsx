import { ReactNode } from "react"
import { WithOptionalChildNodes } from "~/types"

interface PageHeaderProps extends WithOptionalChildNodes {
  title?: ReactNode;
  description?: ReactNode
}

const PageHeaderTitle = ({ children }: WithOptionalChildNodes) => (
  <h1 className="font-heading font-semibold text-3xl xl:text-4xl">{children}</h1>
)

const PageHeaderDescription = ({ children }: WithOptionalChildNodes) => (
  <p className="sm:text-lg text-balance text-muted-foreground">{children}</p>
)

function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2 mb-6">
      {title && <PageHeaderTitle>{title}</PageHeaderTitle>}
      {description && <PageHeaderDescription>{description}</PageHeaderDescription>}
      {children}
    </div>
  )
}

PageHeader.Title = PageHeaderTitle
PageHeader.Description = PageHeaderDescription

export default PageHeader