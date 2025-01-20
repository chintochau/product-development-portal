import React, { createContext, useContext, useState, useEffect } from 'react'
import { useProducts } from './productsContext'
import { useSingleProduct } from './singleProductContext'
import { useTickets } from './ticketsContext'
import { defaultBrands } from '../constant'
import { useDevelopers } from './developerContext'
import _ from 'lodash'
import dayjs from 'dayjs'
import { scaleOrdinal } from '@visx/scale'

export const mainColor = '#0070f3'
export const epicColor = '#22c55e'
export const hardwareColor = '#f59e0b'
export const featureColor = '#ef4444' // red
export const bluosFeatureColor = '#3b82f6' // blue
export const legendColorScale = scaleOrdinal({
  domain: ['Planned', 'Software', 'Hardware', 'App Features', 'BluOS Features'],
  range: [mainColor, epicColor, hardwareColor, featureColor, bluosFeatureColor]
})

// Create the User Context
const RoadmapContext = createContext()

export const RoadmapProvider = ({ children }) => {
  const { products } = useProducts()
  const { featureEpics, epics } = useSingleProduct()
  const { developers } = useDevelopers()
  const { features } = useTickets()

  const [featuersByDevelopers, setFeaturesByDevelopers] = useState([])

  const [showMilestones, setShowMilestones] = useState(false)
  const [shouldLoadWrike, setShouldLoadWrike] = useState(false)
  const [shouldloadFeatures, setShouldloadFeatures] = useState(false)
  const [selectedBrands, setSelectedBrands] = useState(defaultBrands.map((item) => item.value))

  const [productChartData, setProductChartData] = useState([])
  const [epicChartData, setEpicChartData] = useState([])
  const [featureChartData, setFeatureChartData] = useState([])
  const [developersChartData, setDevelopersChartData] = useState([])
  const [chartData, setChartData] = useState([])

  const [range, setRange] = useState([])

  // product data
  useEffect(() => {
    if (products.length > 0) {
      {
        const newChartData = products.map((product, index) => {
          // launch: dayjs(Launch).format('YYYY-MM-DD'),
          // mp1Date: dayjs(MP1).format('YYYY-MM-DD'),
          // mp1DateActual: dayjs(mp1DateActual).format('YYYY-MM-DD'),
          // pifDate: dayjs(pifDate).format('YYYY-MM-DD'),
          // pifDateAccepted: dayjs(pifDateAccepted).format('YYYY-MM-DD'),
          // greenlightDate: dayjs(greenlightDate).format('YYYY-MM-DD'),
          // greenlightTargetMP: dayjs(greenlightTargetMPDate).format('YYYY-MM-DD'),

          const {
            launch,
            mp1Date,
            mp1DateActual,
            pifDate,
            pifDateAccepted,
            greenlightDate,
            greenlightTargetMP,
            bluos
          } = product || {}

          const milestoneDates = {
            launch,
            mp1Date,
            mp1DateActual,
            pifDate,
            pifDateAccepted,
            greenlightDate,
            greenlightTargetMP
          }

          // turn object into array
          const dates = Object.values(milestoneDates)
          const keys = Object.keys(milestoneDates)

          const earliestDate = dates
            .filter((date) => date)
            .sort((a, b) => new Date(a) - new Date(b))[0]

          const singleDates = keys
            .map((key, index) => {
              return {
                name: key,
                date: milestoneDates[key] && new Date(milestoneDates[key])
              }
            })
            .filter((date) => date.date)
          return {
            name: product.projectName,
            brand: product.brand,
            description: product.description,
            bluos: bluos,
            start: new Date(earliestDate),
            end: product.launch ? new Date(product.launch) : new Date(),
            fill: mainColor, // blue,
            epicId: product.epicId,
            wrikeId: product.wrikeId,
            type: 'product',
            opacity: 0.3,
            singleDates: singleDates,
            mp1: mp1Date,
            launch: launch
          }
        })

        setProductChartData([
          ...newChartData
            .filter((item) => selectedBrands.includes(item.brand) && item.bluos)
            .sort((a, b) => new Date(a.mp1) - new Date(b.mp1))
            .map((task) => {
              const epic = epics.find((e) => e.iid === task.epicId)
              return {
                ...task,
                subTasks: [
                  {
                    id: task.id,
                    name: epic?.title,
                    start: new Date(epic?.start_date),
                    end: new Date(epic?.due_date),
                    fill: epicColor, // green
                    epicId: task.epicId
                  }
                ]
              }
            })
        ])
        const minDate = new Date(Math.min(...newChartData.map((t) => t.start.getTime())))
        const maxDate = new Date(Math.max(...newChartData.map((t) => t.end.getTime())))
        setRange([Math.max(minDate, dayjs().subtract(1, 'month').valueOf()), maxDate])
        setShouldLoadWrike(true)
      }
    }
  }, [products, selectedBrands])

  // set features by developers when features or developers change
  useEffect(() => {
    if (features.length > 0 && developers.length > 0) {
      groupFeaturesByDevelopers()
    }
  }, [features, developers])

  // set chartData when featuresByDevelopers change, which is features planned, group by developers
  useEffect(() => {
    if (featuersByDevelopers.length > 0) {
      const developersData = featuersByDevelopers.map((item) => {
        const minDate = Math.min(
          ...item.features.map((feature) =>
            feature.startDate ? new Date(feature.startDate) : Infinity
          )
        )
        let startDate = minDate ? new Date(minDate) : new Date()

        const maxDate = Math.max(
          ...item.features.map((feature) =>
            feature.startDate && feature.estimate
              ? dayjs(feature.startDate).add(feature.estimate, 'day')
              : -Infinity
          )
        )
        let endDate = maxDate ? new Date(maxDate) : new Date()
        return {
          id: item.developer?.id,
          name: item.developer?.name,
          start: startDate,
          end: endDate, // Date()
          fill: '#713000', // dark yellow color
          subTasks: item.features.map((feature) => {
            return {
              id: feature.id,
              name: feature.title,
              start: new Date(feature.startDate),
              end: dayjs(feature.startDate)
                .add(feature.estimate ? feature.estimate : 1, 'day')
                .toDate(),
              fill: ['#FFA500', '#FF4500', '#32CD32', '#00CED1', '#FFD700'][
                Math.floor(Math.random() * 5)
              ]
            }
          })
        }
      })
      setDevelopersChartData(developersData)
    }
  }, [featuersByDevelopers])

  // set Features from Epic, which is features alerady in gitlab Epic with start and due date
  useEffect(() => {
    if (featureEpics.length > 0) {
      const features = featureEpics
        .filter((f) => f.start_date && f.due_date)
        .map((f) => {
          return {
            id: f.id,
            name: f.title,
            start: new Date(f.start_date),
            end: new Date(f.due_date),
            fill: featureColor,
            url: f.web_url
          }
        })
      setEpicChartData(features)
    }
  }, [featureEpics])

  // set features chart data
  useEffect(() => {
    console.log(features)

    setFeatureChartData(
      features
        .filter((f) => f.startDate)
        .map((f) => {
          return {
            id: f.id,
            name: f.title,
            start: new Date(f.startDate ? f.startDate : f.created_at),
            end: new Date(
              f.startDate && f.estimate
                ? dayjs(f.startDate)
                    .add(f.estimate || 30, 'day')
                    .toDate()
                : dayjs().add(30, 'day').toDate()
            ),
            fill: bluosFeatureColor,
            url: f.web_url
          }
        })
    )
  }, [features])

  // group all chart data together
  useEffect(() => {
    setChartData([
      ...productChartData,
      ...epicChartData,
      ...featureChartData,
      ...developersChartData
    ])
  }, [productChartData, epicChartData, featureChartData, developersChartData])

  const groupFeaturesByDevelopers = () => {
    const developerLookup = _.keyBy(developers, 'id')
    // Flatten the features and associate them with their developers
    const featuresByDeveloper = features.flatMap((feature) =>
      feature.assignee_ids
        ? feature.assignee_ids.map((assigneeId) => ({
            developer: developerLookup[assigneeId],
            feature
          }))
        : []
    )
    // Group by developer
    const groupedByDeveloper = _.groupBy(featuresByDeveloper, 'developer.id')
    const groupedFeatures = Object.values(groupedByDeveloper).map((group) => ({
      developer: group[0].developer,
      features: group.map((item) => item.feature)
    }))
    // Transform the grouped data into the desired output format
    setFeaturesByDevelopers(groupedFeatures)
  }

  const fetchDataFromWrike = async (taskData, taskIndex) => {
    try {
      const res = await window.api.wrike(
        `folders/${taskData.wrikeId}/tasks?fields=[subTaskIds]&subTasks=true&title=ship`,
        'GET'
      )
      const res2 = await window.api.wrike(
        `folders/${taskData.wrikeId}/tasks?fields=[subTaskIds]&subTasks=true&title=pif`,
        'GET'
      )
      const wrikeTasks = [...res?.data, ...res2?.data]

      if (!wrikeTasks || !wrikeTasks.length) return

      const wrikeId = wrikeTasks[0].id

      const shippingDates = wrikeTasks.map((wrikeTask) => {
        return {
          id: wrikeTask.id,
          title: wrikeTask.title,
          start: new Date(wrikeTask.dates?.start),
          end: new Date(wrikeTask.dates?.due)
        }
      })

      setChartData((prevData) =>
        prevData.map((task, index) => {
          if (index === taskIndex) {
            return {
              ...task,
              subTasks: [
                ...task.subTasks.filter((subTask) => subTask.wrikeId !== wrikeId),
                ...(shippingDates && shippingDates.length > 0
                  ? [
                      {
                        id: wrikeId,
                        fill: hardwareColor, // yellow
                        wrikeId: wrikeId,
                        dates: [...shippingDates]
                      }
                    ]
                  : [])
              ]
            }
          }
          return task
        })
      )
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (chartData && shouldLoadWrike) {
      setShouldLoadWrike(false)
      chartData.forEach((task, index) => {
        const wrikeId = task.wrikeId
        if (wrikeId) {
          fetchDataFromWrike(task, index)
        }
      })
    }
  }, [chartData, shouldLoadWrike])

  const value = {
    chartData,
    setChartData,
    showMilestones,
    setShowMilestones,
    shouldLoadWrike,
    setShouldLoadWrike,
    shouldloadFeatures,
    setShouldloadFeatures,
    selectedBrands,
    setSelectedBrands,
    featuersByDevelopers,
    range,
    setRange,
    developersChartData,
    featureChartData
  }

  return <RoadmapContext.Provider value={value}>{children}</RoadmapContext.Provider>
}

export const useRoadmap = () => useContext(RoadmapContext)
