import React from "react";
import Link from "next/link";
import { ChevronRight, Layout, Calendar, BarChart, ArrowRight} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import CompanyCarousel from "@/components/company-carousel";
import Image from "next/image";
import { Toaster } from "@/components/ui/sonner";
import Reveal from "@/components/Reveal";

const faqs = [
  {
    question: "What is Task Nest?",
    answer:
      "Task Nest is a powerful project management tool designed to help teams organize, track, and manage their work efficiently. It combines intuitive design with robust features to streamline your workflow and boost productivity.",
  },
  {
    question: "How does Task Nest compare to other project management tools?",
    answer:
      "Task Nest offers a unique combination of intuitive design, powerful features, and flexibility. Unlike other tools, we focus on providing a seamless experience for both agile and traditional project management methodologies, making it versatile for various team structures and project types.",
  },
  {
    question: "Is Task Nest suitable for small teams?",
    answer:
      "Absolutely! Task Nest is designed to be scalable and flexible. It works great for small teams and can easily grow with your organization as it expands. Our user-friendly interface ensures that teams of any size can quickly adapt and start benefiting from Task Nest's features.",
  },
  {
    question: "What key features does Task Nest offer?",
    answer:
      "Task Nest provides a range of powerful features including intuitive Kanban boards for visualizing workflow, robust sprint planning tools for agile teams, comprehensive reporting for data-driven decisions, customizable workflows, time tracking, and team collaboration tools. These features work seamlessly together to enhance your project management experience.",
  },
  {
    question: "Can Task Nest handle multiple projects simultaneously?",
    answer:
      "Yes, Task Nest is built to manage multiple projects concurrently. You can easily switch between projects, and get a bird's-eye view of all your ongoing work. This makes Task Nest ideal for organizations juggling multiple projects or clients.",
  },
  {
    question: "Is there a learning curve for new users?",
    answer:
      "While Task Nest is packed with features, we've designed it with user-friendliness in mind. New users can quickly get up to speed thanks to our intuitive interface, helpful onboarding process, and comprehensive documentation.",
  },
];

const features = [
  {
    title: "Intuitive Kanban Boards",
    description:
      "Visualize your workflow and optimize team productivity with our easy-to-use Kanban boards.",
    icon: Layout,
  },
  {
    title: "Powerful Sprint Planning",
    description:
      "Plan and manage sprints effectively, ensuring your team stays focused on delivering value.",
    icon: Calendar,
  },
  {
    title: "Comprehensive Reporting",
    description:
      "Gain insights into your team's performance with detailed, customizable reports and analytics.",
    icon: BarChart,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-black text-white">
      {/* Hero Section */}
      <section className="container mx-auto py-20 text-center">
        <Reveal>
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent pb-6 flex flex-col">
            Streamline Your Workflow <br />
            <span className="flex mx-auto gap-3 sm:gap-4 items-center">
              <div className="flex items-center justify-center gap-4">
                <div className="relative">
                  <Image
                    src={"/task-nest-icon.svg"}
                    alt="Task Nest Icon"
                    width={80}
                    height={80}
                    className="h-16 sm:h-24 w-16 sm:w-24 object-contain animate-float"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-green-300 to-teal-400 opacity-20 rounded-full animate-color-shift"></div>
                </div>
                <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 via-green-300 to-teal-400 bg-clip-text text-transparent">Task Nest</span>
              </div>
            </span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Empower your team with our intuitive project management solution.
          </p>
        </Reveal>
        <Reveal delay={0.4}>
          <div className="flex justify-center gap-4">
            <Link href="/onboarding">
              <Button
                size="lg"
                className="mr-2 bg-blue-600 hover:bg-blue-700 transition-all duration-300 shadow-xl"
              >
                Get Started <ChevronRight size={18} className="ml-1" />
              </Button>
            </Link>
            <Link href="#features">
              <Button
                size="lg"
                variant="outline"
                className="border-gray-400 hover:border-white hover:text-white transition-all duration-300"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="bg-gradient-to-b from-gray-900 to-gray-950 py-20 px-5"
      >
        <div className="container mx-auto">
          <Reveal>
            <h3 className="text-3xl font-bold mb-12 text-center text-white">
              Key Features
            </h3>
          </Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Reveal key={index} delay={index * 0.2}>
                <Card className="bg-gray-800 transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-xl">
                  <CardContent className="pt-6 text-center">
                    <feature.icon className="h-12 w-12 mb-4 text-blue-400" />
                    <h4 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-gray-300">{feature.description}</p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Companies Carousel */}
      <section className="py-20">
        <div className="container mx-auto">
          <Reveal>
            <h3 className="text-3xl font-bold mb-12 text-center text-white">
              Trusted by Industry Leaders
            </h3>
          </Reveal>
          <CompanyCarousel />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gradient-to-b from-gray-950 to-black py-20 px-5">
        <div className="container mx-auto">
          <Reveal>
            <h3 className="text-3xl font-bold mb-12 text-center text-white">
              Frequently Asked Questions
            </h3>
          </Reveal>
          <Accordion
            type="single"
            collapsible
            className="w-full max-w-3xl mx-auto"
          >
            {faqs.map((faq, index) => (
              <Reveal key={index} delay={index * 0.15}>
                <AccordionItem
                  value={`item-${index}`}
                  className="transition-all duration-300 hover:bg-gray-800 rounded-lg mb-4"
                >
                  <AccordionTrigger className="text-left text-lg font-medium text-white px-4 py-3">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300 px-4 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </Reveal>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center px-5">
        <div className="container mx-auto">
          <Reveal>
            <h3 className="text-3xl font-bold mb-6 text-white">
              Ready to Transform Your Workflow?
            </h3>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-xl mb-12 text-gray-400">
              Join thousands of teams already using Task Nest to streamline their
              projects and boost productivity.
            </p>
          </Reveal>
          <Reveal delay={0.4}>
            <Link href="/onboarding">
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 text-white hover:opacity-90 shadow-lg animate-bounce"
              >
                Start For Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
