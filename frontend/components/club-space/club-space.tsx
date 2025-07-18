"use client"

import { useState } from "react"
import { ClubSidebar } from "./club-sidebar"
import { ClubDiscussion } from "./club-discussion"
import { ClubEvents } from "./club-events"
import { ClubResources } from "./club-resources"
import { ClubMembers } from "./club-members"
import { ClubAbout } from "./club-about"
import { ClubRightSidebar } from "./club-right-sidebar"

interface Club {
  club_id: string
  name: string
  logo_url: string
  members: number
  role: string
}

interface ClubSpaceProps {
  club: Club
  activeTab: string
}

export function ClubSpace({ club, activeTab }: ClubSpaceProps) {
  const [currentTab, setCurrentTab] = useState(activeTab)

  const renderTabContent = () => {
    switch (currentTab) {
      case "discussion":
        return <ClubDiscussion clubId={club.club_id} />
      case "events":
        return <ClubEvents clubId={club.club_id} />
      case "resources":
        return <ClubResources clubId={club.club_id} />
      case "members":
        return <ClubMembers clubId={club.club_id} />
      case "about":
        return <ClubAbout clubId={club.club_id} />
      default:
        return <ClubDiscussion clubId={club.club_id} />
    }
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Club Navigation Sidebar */}
      <ClubSidebar club={club} activeTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto">{renderTabContent()}</div>

        {/* Right Sidebar */}
        <ClubRightSidebar clubId={club.club_id} />
      </div>
    </div>
  )
}
