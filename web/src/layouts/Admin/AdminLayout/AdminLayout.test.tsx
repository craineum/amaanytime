import { render, screen } from '@redwoodjs/testing/web'

import { AdminLayout } from './AdminLayout'

describe('AdminLayout', () => {
  it('renders successfully', () => {
    const children = 'Test Children'
    expect(() => {
      render(<AdminLayout>{children}</AdminLayout>)
    }).not.toThrow()

    expect(screen.getByText(children)).toBeInTheDocument()
  })
})