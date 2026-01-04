import PageHeader from "~/components/page_header";
import SeriesAddon from "~/components/series_addon";
import { Button } from "~/components/ui/button";

function Series() {
  return (
    <>
      <PageHeader
        title="Series"
        description="Our series are curated collections of lessons that walk through a specific topic from beginning to end. Series are a great way to learn a topic in a structured way."
      />

      <div className="hero">
        <h1 className="text-red-500">Series</h1>
        <p>
          Powered by Inertia and React, this setup blends server-driven routing with rich
          client-side interactivity — seamless, fast, and cohesive.
        </p>
      </div>

      <div className="cards">
        <a href="https://insiders.adonisjs.com/docs/v7-alpha/introduction" target="_blank">
          <h3>Official Docs &nbsp;›</h3>
          <p>Comprehensive reference for building with AdonisJS</p>
        </a>

        <a href="https://adocasts.com/" target="_blank">
          <h3>Adocasts &nbsp;›</h3>
          <p>Guided video tutorials for everyday development</p>
        </a>

        <a href="https://discord.gg/vDcEjq6" target="_blank">
          <h3>Discord &nbsp;›</h3>
          <p>Connect with developers building with AdonisJS every day</p>
        </a>
      </div>

      <Button>Click Me</Button>
    </>
  )
}

Series.addon = () => <SeriesAddon />

export default Series