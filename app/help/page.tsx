import { Navbar } from "@/components/navbar/Navbar"
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I book a consultation?",
      answer: "Browse our list of consultants, choose one that fits your needs, select an available time slot, and follow the booking process. You'll receive a confirmation once the booking is successful."
    },
    {
      question: "What are the payment methods?",
      answer: "We support major credit cards, debit cards, and online payment gateways. Payments are processed securely."
    },
    {
      question: "Can I cancel or reschedule my appointment?",
      answer: "Yes, you can cancel or reschedule through your client dashboard up to 24 hours before the scheduled time. Check the consultant's specific policy for details."
    },
    {
      question: "How do I become a consultant?",
      answer: "Register as a consultant, complete your profile, and provide the necessary verification documents. Our team will review your application within 2-3 business days."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-lg text-gray-600">Find answers to common questions about ConsultBook.</p>
        </div>

        <div className="relative mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input className="pl-12 py-6 text-lg rounded-2xl shadow-sm" placeholder="Search for help topics..." />
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium text-gray-900 hover:text-blue-600">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
    </div>
  )
}
