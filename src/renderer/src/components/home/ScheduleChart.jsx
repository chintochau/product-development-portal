import React, { useCallback, useEffect, useState } from 'react'
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { useProducts } from '../../contexts/productsContext';
dayjs.extend(isBetween);

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
    mp1Date: {
        label: "mp1Date",
        color: "hsl(var(--chart-1))",
    },
    launchDate: {
        label: "launchDate",
        color: "hsl(var(--chart-2))",
    },
    createdAt: {
        label: "today",
        color: "hsl(var(--background))",
    },
}
const ScheduleChart = () => {
    const { products } = useProducts();

    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        setChartData(
            products.map((product) => ({
                projectName: product.projectName,
                today: dayjs().valueOf(),
                createdAt: dayjs(product.created_at).valueOf(),
                mp1Date: Math.abs(dayjs(product.mp1Date).diff(dayjs(), 'milliseconds')), // calculate the timestamp difference from today
                launchDate: dayjs(product.launchDate).diff(product.mp1Date, 'milliseconds'), // Convert to timestamp
            }))
        );
    }, [products]);


    console.log(chartData);



    return (
        <Card>
            <CardHeader>
                <CardTitle>Bar Chart - Start Day and Launch Day</CardTitle>
                <CardDescription>Showing MP1 and Launch Dates</CardDescription>
            </CardHeader>
            <CardContent>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Showing total visitors for the last 6 months
                </div>
            </CardFooter>
        </Card>
    );
};

export default ScheduleChart;
