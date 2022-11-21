import { test, expect } from '@playwright/test'

import { db } from '../../api/src/lib/db'

const MOCK_USER = {
  email: 'cereal@example.com',
  name: 'SnapCracklePop',
  nickname: 'waffleCrisp',
  pronouns: 'cheerios',
}

const NEW_MOCK_INFO = {
  name: 'Harry Potter',
  nickname: 'Chosen One',
  pronouns: 'he/him',
}

test.use({ storageState: 'web/tests/storage/adminUser-pw.json' })
test.beforeEach(async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('text=Admin').first()).toBeVisible()

  await page.locator('text=Admin').first().click()
  await page.waitForURL('/admin/users')
})

test.describe('admin crud user', async () => {
  test('admin creates a new user', async ({ page }) => {
    const newUser = page.locator('text=New User').first()
    await expect(newUser).toBeVisible()
    await newUser.click()
    await page.waitForURL('/admin/users/new')
    await page.locator('input[name="email"]').click()
    await page.locator('input[name="email"]').fill(MOCK_USER.email)
    await page.locator('input[name="name"]').click()
    await page.locator('input[name="name"]').fill(MOCK_USER.name)
    await page.locator('input[name="nickname"]').click()
    await page.locator('input[name="nickname"]').fill(MOCK_USER.nickname)
    await page.locator('input[name="pronouns"]').click()
    await page.locator('input[name="pronouns"]').fill(MOCK_USER.pronouns)

    await page.getByLabel('Active').check()
    expect(page.getByLabel('Active').isChecked()).toBeTruthy()

    await page.locator('button:has-text("Save")').click()
    await page.waitForURL('/admin/users')
    const newUserToast = page.locator('text=User created')
    await expect(newUserToast).toBeVisible()
    const newUserList = page.locator(`text=${MOCK_USER.email}`)
    await expect(newUserList).toBeVisible()
  })

  test('admin shows a user', async ({ page }) => {
    const newlyCreatedUser = await db.user.findUnique({
      where: { email: MOCK_USER.email },
    })
    await page.goto(`/admin/users/${newlyCreatedUser?.id}`)

    const mockEmail = page.locator(`text=${MOCK_USER.email}`)
    await expect(mockEmail).toBeVisible()
    const mockName = page.locator(`text=${MOCK_USER.name}`)
    await expect(mockName).toBeVisible()
    const mockNickname = page.locator(`text=${MOCK_USER.nickname}`)
    await expect(mockNickname).toBeVisible()
    const mockPronouns = page.locator(`text=${MOCK_USER.pronouns}`)
    await expect(mockPronouns).toBeVisible()
  })

  test('admin edits a user', async ({ page }) => {
    const newlyCreatedUser = await db.user.findUnique({
      where: { email: MOCK_USER.email },
    })
    await page.goto(`/admin/users/${newlyCreatedUser?.id}/edit`)

    await page.locator('input[name="name"]').click()
    await page.locator('input[name="name"]').fill(NEW_MOCK_INFO.name)
    await page.locator('input[name="nickname"]').click()
    await page.locator('input[name="nickname"]').fill(NEW_MOCK_INFO.nickname)
    await page.locator('input[name="pronouns"]').click()
    await page.locator('input[name="pronouns"]').fill(NEW_MOCK_INFO.pronouns)

    await page.locator('button:has-text("Save")').click()
    await page.waitForURL('/admin/users')

    await page.goto(`/admin/users/${newlyCreatedUser?.id}`)
    const mockName = page.locator(`text=${NEW_MOCK_INFO.name}`)
    await expect(mockName).toBeVisible()
    const mockNickname = page.locator(`text=${NEW_MOCK_INFO.nickname}`)
    await expect(mockNickname).toBeVisible()
    const mockPronouns = page.locator(`text=${NEW_MOCK_INFO.pronouns}`)
    await expect(mockPronouns).toBeVisible()
  })

  test('admin removes a user', async ({ page }) => {
    const newlyCreatedUser = await db.user.findUnique({
      where: { email: MOCK_USER.email },
    })
    await page.goto(`/admin/users/${newlyCreatedUser?.id}`)

    page.once('dialog', (dialog) => {
      dialog.accept().catch(() => {})
    })
    await page.locator('text=Remove').click()

    const toastMessage = page.locator('text=User Removed')
    await expect(toastMessage).toBeVisible()
    await page.waitForURL('/admin/users')
    const removedEmail = page.locator(`text=${MOCK_USER.email}`)
    await expect(removedEmail).not.toBeVisible()
  })

  test('admin archives a user', async ({ page }) => {
    page.once('dialog', (dialog) => {
      dialog.accept().catch(() => {})
    })
    await page.locator('text=Archive').first().click()

    const toastMessage = page.locator('text=User updated')
    await expect(toastMessage).toBeVisible()

    const reactivateMessage = page.locator('text=Reactivate')
    await expect(reactivateMessage).toBeVisible()

    page.once('dialog', (dialog) => {
      dialog.accept().catch(() => {})
    })
    await page.locator('text=Reactivate').first().click()
    const updatedMessage = page.locator('text=User updated')
    await expect(updatedMessage).toBeVisible()

    await expect(reactivateMessage).not.toBeVisible()
  })
})