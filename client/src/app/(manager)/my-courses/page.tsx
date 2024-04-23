import { courseManagerApiRequests } from '@/services/course.service'
import { HeaderManager } from '@/app/(manager)/layout'
import CourseCard from '@/components/CourseCard'
import { GraduationCap } from 'lucide-react'
import { cookies } from 'next/headers'
import CreateCourseModal from '@/app/(manager)/my-courses/_components/create-course-modal'

const MyCoursePage = async () => {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('accessToken')?.value as string
  const { payload } = await courseManagerApiRequests.getList(accessToken)
  const listCourses: any = payload
  return (
    <>
      <HeaderManager icon={<GraduationCap />} title="My Courses" />
      <div className="p-5 grid grid-cols-4 gap-8 w-full">
        <CreateCourseModal />
        {listCourses.map((course: any, index: number) => (
          <CourseCard isAuth key={index} data={course} />
        ))}
      </div>
    </>
  )
}

export default MyCoursePage