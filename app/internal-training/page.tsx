import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card } from '@/components/ui/card'

export default function InternalTrainingPage() {
  return (
    <DashboardLayout pageTitle='Internal Training'>
      <Card className='p-6'>
        <p className='text-muted-foreground'>Training content coming soon...</p>
      </Card>
    </DashboardLayout>
  )
}
