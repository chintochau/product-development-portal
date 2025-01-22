import React, { createContext, useContext, useState, useEffect } from 'react'
import { useProducts } from './productsContext'
import { useSingleProduct } from './singleProductContext'
import { useTickets } from './ticketsContext'
import { defaultBrands } from '../constant'
import { useDevelopers } from './developerContext'
import _ from 'lodash'
import dayjs from 'dayjs'
import { scaleOrdinal } from '@visx/scale'

export const productsColor = "hsl(var(--chart-1))"; // A deeper blue for good contrast
export const epicColor = 'hsl(var(--chart-2))'; // A vibrant green with good accessibility
export const hardwareColor = 'hsl(var(--chart-3))'; // A warm orange (already good)
export const featureColor = 'hsl(var(--chart-4))'; // A bold red for better visibility
export const bluosFeatureColor = 'hsl(var(--chart-5))'; // A slightly darker, distinct blue
export const legendColorScale = scaleOrdinal({
  domain: ['Products',  'Hardware', 'App', 'BluOS'],
  range: [productsColor,  hardwareColor, featureColor, bluosFeatureColor]
})

// Create the User Context
const RoadmapContext = createContext()

export const RoadmapProvider = ({ children }) => {
  const { products } = useProducts()
  const { featureEpics, epics } = useSingleProduct()
  const { developers } = useDevelopers()
  const { features } = useTickets()

  const [featuersByDevelopers, setFeaturesByDevelopers] = useState([])

  // Filtered state
  const [showMilestones, setShowMilestones] = useState(false)
  const [shouldLoadWrike, setShouldLoadWrike] = useState(false)
  const [shouldloadFeatures, setShouldloadFeatures] = useState(false)
  const [selectedBrands, setSelectedBrands] = useState(defaultBrands.map((item) => item.value))
  const [showSubTasks, setShowSubTasks] = useState(false)
  const [showDevelopers, setShowDevelopers] = useState(true)

  // Data
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
            id: product.iid,
            name: product.projectName,
            brand: product.brand,
            description: product.description,
            bluos: bluos,
            start: new Date(earliestDate),
            end: product.launch ? new Date(product.launch) : new Date(),
            fill: productsColor, // blue,
            epicId: product.epicId,
            wrikeId: product.wrikeId,
            type: 'product',
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
              const productFeatures = features
                .filter((f) => f.product === task.id)
                .map((f) => {
                  return {
                    id: f.id,
                    name: f.title,
                    developer: f.assignee_ids?.map(
                      (id) => developers.find((d) => d.id === id)?.name
                    ),
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

                

              const epic = epics.find((e) => e.iid === task.epicId)
              return {
                ...task,
                subTasks: [
                  ...productFeatures,
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
            feature.startDate ? new Date(feature.startDate) : new Date()
          )
        )
        let startDate = minDate ? new Date(minDate) : new Date()

        const maxDate = Math.max(
          ...item.features.map((feature) =>
            feature.startDate && feature.estimate
              ? dayjs(feature.startDate).add(feature.estimate, 'day')
              : new Date()
          )
        )
        let endDate = maxDate ? new Date(maxDate) : new Date()
        return {
          id: item.developer?.id,
          name: item.developer?.name,
          start: startDate,
          end: endDate, // Date()
          fill: 'hsl(var(--alternative))', // dark yellow color
          subTasks: item.features.map((feature) => {
            return {
              id: feature.id,
              name: feature.title,
              developer: feature.assignee_ids.map(
                (id) => developers.find((d) => d.id === id)?.name
              ),
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
      }).sort((a, b) => new Date(a.start) - new Date(b.start))
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
    setFeatureChartData(
      features
        .filter((f) => f.startDate)
        .map((f) => {
          return {
            id: f.id,
            name: f.title,
            developer: f.assignee_ids?.map((id) => developers.find((d) => d.id === id)?.name),
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
        .sort((a, b) => new Date(a.start) - new Date(b.start))
    )
  }, [features])

  // group all chart data together
  useEffect(() => {
    setChartData([
      ...productChartData,
      ...epicChartData,
      ...featureChartData,
      ...(showDevelopers ? developersChartData : [])
    ])
  }, [productChartData, epicChartData, featureChartData, developersChartData, showDevelopers])

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
    featureChartData,
    showSubTasks,
    setShowSubTasks,
    showDevelopers, setShowDevelopers
  }

  return <RoadmapContext.Provider value={value}>{children}</RoadmapContext.Provider>
}

export const useRoadmap = () => useContext(RoadmapContext)
