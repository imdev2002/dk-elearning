import FormTabs from '@/app/(manager)/forms/_components/form-tabs'
import RequestsTable from '@/app/(manager)/forms/_components/requests-table'
import { Heading } from '@/components/heading'
import { UpgradeRole } from '@/components/icons/sidebar/updarade-role'
import { displayFullname, generateMediaLink } from '@/lib/utils'
import { formApiRequest } from '@/services/form.service'
import {
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import { cookies } from 'next/headers'
import React from 'react'

const page = async () => {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('accessToken')?.value as string
  const { payload } = await formApiRequest.getList(accessToken)

  return (
    <>
      <Heading icon={<UpgradeRole />} title="Form request" />
      <FormTabs data={payload} />
    </>
  )
}

export default page
