import { Tab, Tabs, Typography } from '@mui/material'
import React from 'react'
export interface ITabViewContainer {
  options: { id: number; label: string; view: any }[]
  selectedTabId?: number
}

class TabViewContainer extends React.Component<ITabViewContainer> {
  public state = {
    value: 0,
  }

  constructor(props: Readonly<ITabViewContainer>) {
    super(props)

    if (props.selectedTabId) {
      this.state = { value: props.selectedTabId }
    }
  }

  public render() {
    const { options } = this.props
    const tabOptions = []
    const tabPanels = []

    const responsiveTabs = (
      <Tabs
        aria-label="Tabs"
        className="min-w-[200px] bg-background-main"
        onChange={this.handleChange}
        indicatorColor="primary"
        scrollButtons
        value={this.state.value}
        variant="scrollable"
        allowScrollButtonsMobile
      >
        {tabOptions}
      </Tabs>
    )

    options.map((option, index) => {
      tabOptions.push(
        <Tab
          label={option.label}
          id={`scrollable-auto-tab-${index}`}
          aria-controls={`scrollable-auto-tabpanel-${index}`}
          key={index}
        />
      )

      tabPanels.push(
        <TabPanel
          containerClassName="w-full h-full justify-center bg-background-main"
          tabPanelClassName="flex flex-col px-2  h-full "
          value={this.state.value}
          index={index}
          key={index}
        >
          {option.view}
        </TabPanel>
      )
    })

    return (
      <div className="flex min-h-[400px] w-full flex-grow flex-col bg-background-main">
        {responsiveTabs}
        {tabPanels}
      </div>
    )
  }

  private handleChange = (event: React.ChangeEvent<Element>, newValue: number) => {
    this.setState({ value: newValue })
  }
}

export default TabViewContainer

interface ITabPanelProps {
  children?: React.ReactNode
  index: any
  value: any
  containerClassName: any
  tabPanelClassName: any
}

function TabPanel(props: ITabPanelProps) {
  const { children, value, index, containerClassName, tabPanelClassName, ...other } = props

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      className={containerClassName}
      {...other}
    >
      <div className={tabPanelClassName}>{children}</div>
    </Typography>
  )
}
