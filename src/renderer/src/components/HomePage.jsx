import React, { useState, useEffect } from 'react'
import {
  Home,
  FileText,
  User,
  List,
  Map,
  LayoutDashboard,
  Edit,
  MapPin,
  BarChart,
  Settings,
  ChevronRight,
  Search,
  Bell,
  UserCircle
} from 'lucide-react'
import { useUser } from '../contexts/userContext'
import { usePermissions } from '../contexts/permissionContext'
import { useNavigate } from 'react-router-dom'
import { navigationItems } from '../constant'
import { useTickets } from '../contexts/ticketsContext'

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const { userRole } = usePermissions()

  const navigate = useNavigate()
  const { user } = useUser()

  const {features} = useTickets()

  // Navigation handler function
  const handleNavigation = (url) => {
    // Instead of using react-router's navigate, use your app's navigation method
    // For electron apps, this could be window.location or a custom navigation function

    navigate(url)
    // Example implementation:
    // window.location.hash = url; // For hash-based routing
    // or
    // window.history.pushState({}, '', url); // For history API

    // If you have a custom navigation function from props:
    // props.onNavigate(url);
  }

  // Define navigation sections based on user access level
  const getNavigationCards = () => {
    if (!user) return []

    const cards = navigationItems.flatMap((item) =>
      item.nested
        ? [
            item,
            ...item.nested.map((nestedItem) => ({
              ...nestedItem
            }))
          ]
        : [item]
    )

    return cards.filter((card) => userRole.access <= card.access && !card.hide)
  }

  const filteredCards = getNavigationCards().filter(
    (card) =>
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className=" ">
      {/* Header */}
      <header className="shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Product Management Portal</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Bell size={20} />
            </button>
            <div className="flex items-center space-x-2">
              <UserCircle size={24} />
              <span className="font-medium">{user.name}</span>
              <span className="px-2 py-1 text-xs  text-blue-800 rounded-full">{user.role}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Welcome back, {user.name}</h2>
          <p className="text-gray-600">Quick access to your product management tools</p>
        </div>

        {/* Navigation cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredCards.map((card, index) => (
            <div
              key={index}
              className=" rounded-lg shadow border border-border hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
              onClick={() => handleNavigation(card.url)}
            >
              <div className={`h-2 ${card.color}`}></div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className={`p-3 rounded-lg ${card.color} bg-opacity-10`}>
                    <card.icon />
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-1">{card.title}</h3>
                <p className="text-sm text-gray-500">{card.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent activity section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recent features */}
          <div className=" rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Recent Features</h3>
              <button
                className="text-blue-500 text-sm font-medium flex items-center"
                onClick={() => handleNavigation('/features')}
              >
                View all <ChevronRight size={16} />
              </button>
            </div>
            <div className="space-y-4">
              {features?.slice(0, 5).map((feature) => (
                <div
                  key={feature.id}
                  className="p-4 border rounded-lg"
                //   onClick={() => handleNavigation(`/features/${feature.id}`)}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{feature.title}</h4>
                    {/* <ChevronRight size={16} className="text-gray-400" /> */}
                  </div>
                </div>
              ))}
              <button
                className="w-full py-2 border border-dashed rounded-lg text-gray-500 hover:bg-gray-50 flex items-center justify-center space-x-2"
                onClick={() => handleNavigation('/features')}
              >
                <Edit size={16} />
                <span>New Feature Request</span>
              </button>
            </div>
          </div>

          {/* Recent projects */}
          <div className=" rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Recent Projects</h3>
              <button
                className="text-blue-500 text-sm font-medium flex items-center"
                onClick={() => handleNavigation('/project-hub')}
              >
                View all <ChevronRight size={16} />
              </button>
            </div>
            <div className="space-y-4">
              {user.recentProjects?.map((project) => (
                <div
                  key={project.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleNavigation(`/project-hub/${project.id}`)}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{project.title}</h4>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </div>
              ))}
              <button
                className="w-full py-2 border border-dashed rounded-lg text-gray-500 hover:bg-gray-50 flex items-center justify-center space-x-2"
                onClick={() => handleNavigation('/project-hub/new')}
              >
                <LayoutDashboard size={16} />
                <span>Create New Project</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default HomePage
