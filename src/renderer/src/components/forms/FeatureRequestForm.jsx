import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '../../../../components/ui/input'
import { Button } from '../../../../components/ui/button'
import { Textarea } from '../../../../components/ui/textarea'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { Markdown as MarkdownExtension } from 'tiptap-markdown'
import { EditorContent, useEditor } from '@tiptap/react'
import Placeholder from '@tiptap/extension-placeholder'
import { createFeatureRequestIssue, updateFeatureRequestIssue } from '../../services/gitlabServices'
import { useNavigate } from 'react-router-dom'
import { useTickets } from '../../contexts/ticketsContext'
import { Fragment, useEffect } from 'react'
import { useUser } from '../../contexts/userContext'
import { defaultPlatforms } from '../../constant'
import { Checkbox } from '../../../../components/ui/checkbox'

const extensions = [
  StarterKit.configure({
    bulletList: {
      keepMarks: true
    },
    orderedList: {
      keepMarks: true
    }
  }),
  Placeholder.configure({
    placeholder: `E.g., 
Functional Requirements:
	•	Add a toggle switch in the settings menu for enabling/disabling Dark Mode.
	•	Automatically detect system-wide Dark Mode preference on supported devices.
	•	Ensure Dark Mode applies to all screens, including login, dashboard, and settings.

Non-Functional Requirements:
	•	Maintain a consistent color contrast ratio of at least 4.5:1 for accessibility.
	•	Ensure performance impact remains minimal (<5% increase in load time).
	•	Implement fallback to default Light Mode on unsupported older devices.`
  }),
  MarkdownExtension
]
const formSchema = z.object({
  title: z.string(),
  overview: z.string(),
  currentProblems: z.string(),
  requirements: z.string(),
  platforms: z.array(z.string())
})

export function FeatureRequestForm({ editMode }) {
  const { setShouldRefresh, selectedTicket, setSelectedTicket } = useTickets()
  const { user } = useUser()

  const navigate = useNavigate()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      overview: '',
      currentProblems: '',
      requirements: '',
      platforms: []
    }
  })

  const onSubmit = async (values) => {
    if (editMode) {
      const newData = { ...selectedTicket, ...values }
      await updateFeatureRequestIssue(selectedTicket.iid, newData)
      setShouldRefresh(true)
      setSelectedTicket(newData)
      navigate(`/features/${selectedTicket.iid}`)
    } else {
      await createFeatureRequestIssue({ requestor: user.username, ...values })
      setShouldRefresh(true)
      navigate('/features')
    }
  }

  const editor = useEditor({
    extensions: extensions,
    content: form.watch('requirements'),
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose  dark:prose-invert md:max-w-full p-4 focus:outline-none border rounded-md min-h-80 overflow-y-auto'
      }
    },
    onUpdate: ({ editor }) => {
      form.setValue('requirements', editor.storage.markdown.getMarkdown())
    },
    placeholder: 'Requirements'
  })

  useEffect(() => {
    if (selectedTicket && editMode) {
      form.reset((previousValues) => ({
        ...previousValues,
        ...selectedTicket
      }))
    }
  }, [selectedTicket, form])

  return (
    <div className="px-4">
      <h1 className="text-2xl mb-4">Submit a Feature Request</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="platforms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platforms</FormLabel>
                <div className="flex gap-2 items-center">
                  {defaultPlatforms.map((platform) => (
                    <div key={platform} className=" space-x-1">
                      <Checkbox
                        value={platform}
                        id={platform}
                        checked={field.value.includes(platform)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...field.value, platform])
                          } else {
                            field.onChange(field.value.filter((value) => value !== platform))
                          }
                        }}
                      >
                        {platform}
                      </Checkbox>
                      <label htmlFor={platform}>{platform}</label>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="E.g., Implement Dark Mode for Mobile App" {...field} />
                </FormControl>
                <FormDescription>
                  Provide a clear and concise name for the feature request.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="overview"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Overview</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="E.g., Dark Mode will reduce eye strain for users in low-light environments and improve usability at night."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Briefly describe the feature and its purpose. Include who it benefits and why it’s
                  needed
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currentProblems"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Problems</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="E.g., Users have reported discomfort using the app at night due to bright interface colors."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Identify the specific problems or pain points that this feature will address.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="requirements"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Requirements</FormLabel>
                <FormControl>
                  <div>
                    <style>{`
.tiptap p.is-editor-empty:first-child::before {
  color: #6b7280;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
                    `}</style>
                    <EditorContent editor={editor} value={form.watch('requirements')} />
                  </div>
                </FormControl>
                <FormDescription>
                  Outline the technical or functional requirements needed to implement the feature.
                  Include any key constraints or considerations.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  )
}
