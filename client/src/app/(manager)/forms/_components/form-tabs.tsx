'use client'

import RequestsTable from '@/app/(manager)/forms/_components/requests-table'
import { Tab, Tabs } from '@nextui-org/react'
import React from 'react'

type Props = {
  data?: any
}

const FormTabs = ({ data }: Props) => {
  return (
    <Tabs
      aria-label="Options"
      classNames={{
        base: 'w-full mt-4',
        tabList: 'w-full max-w-full',
      }}
      color="primary"
    >
      <Tab key="photos" title="PENDING">
        <RequestsTable data={data} />
      </Tab>
      <Tab key="music" title="REJECTED">
        <RequestsTable data={data} />
      </Tab>
      <Tab key="videos" title="ACCEPTED">
        <RequestsTable data={data} />
      </Tab>
    </Tabs>
  )
}

export default FormTabs