"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

interface ChartData {
  date: string
  total_galon: number
  total_price: number
}

const chartConfig = {
  galon: {
    label: "Total Galon",
    color: "var(--primary)",
  },
  revenue: {
    label: "Total Revenue",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive({ data = [] }: { data?: ChartData[] }) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")
  const [metric, setMetric] = React.useState<"total_galon" | "total_price">("total_galon")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = data.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date()
    let daysToSubtract = 30
    if (timeRange === "90d") {
      daysToSubtract = 90
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  const metricLabel = metric === "total_galon" ? "Galon" : "Revenue"
  const total = filteredData.reduce((acc, curr) => acc + curr[metric], 0)

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex-1">
          <CardTitle>Transaction Statistics</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              Daily {metricLabel.toLowerCase()} for the selected period
            </span>
            <span className="@[540px]/card:hidden">Per day</span>
          </CardDescription>
        </div>
        <CardAction className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            multiple={false}
            value={[metric]}
            onValueChange={(v) => {
              if (v[0]) setMetric(v[0] as typeof metric)
            }}
            variant="outline"
          >
            <ToggleGroupItem value="total_galon">Galon</ToggleGroupItem>
            <ToggleGroupItem value="total_price">Revenue</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup
            multiple={false}
            value={timeRange ? [timeRange] : []}
            onValueChange={(value) => {
              setTimeRange(value[0] ?? "30d")
            }}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select
            value={timeRange}
            onValueChange={(value) => {
              if (value !== null) {
                setTimeRange(value)
              }
            }}
          >
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="mb-2 text-sm font-medium text-muted-foreground px-2">
          Total: <span className="font-bold text-foreground">
            {metric === "total_price"
              ? `Rp ${total.toLocaleString("en-US")}`
              : `${total.toLocaleString("en-US")} galon`}
          </span>
        </div>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillMetric" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={`var(--color-${metric === "total_galon" ? "galon" : "revenue"})`}
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor={`var(--color-${metric === "total_galon" ? "galon" : "revenue"})`}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                  formatter={(value) => {
                    if (metric === "total_price") {
                      return `Rp ${Number(value).toLocaleString("en-US")}`
                    }
                    return `${value} galon`
                  }}
                />
              }
            />
            <Area
              dataKey={metric}
              type="natural"
              fill="url(#fillMetric)"
              stroke={`var(--color-${metric === "total_galon" ? "galon" : "revenue"})`}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
