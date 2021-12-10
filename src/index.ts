import { App, getCurrentInstance } from "vue"

// 定義 cron 的型態
interface cronProps {
  timer: NodeJS.Timer,
  method: string,
  autoStart: boolean,
  timerRunning: boolean,
  time: number,
  lastInvocation: number
}
// 定義陣列 定時工作項目:jobsTable & 在執行的工作項目:jobsRunning 並給初始值
let jobsTable : cronProps[] =[]
let jobsRunning : cronProps[] =[]

export default {
  install: (app:App, options:  {cron: cronProps} | {cron: Array<cronProps>}) => {
    
    // 記錄定時工作的項目
    const recCron = (cron: cronProps)=>{
      let jobIndex: number = -1
      if (jobsTable) {
        jobIndex = jobsTable.findIndex((i) => i.method === cron.method )
      }
      
      // 若jobsTable 沒有記錄, 則記錄
      if (jobIndex === -1){
        jobsTable.push({...cron})
      }
    }
    
    const cronService = {
      add: (crons: cronProps | Array<cronProps> ) => {        
        if (Array.isArray(crons)) {
          crons.forEach(cron => {
            // 記錄 cron
            recCron(cron)
            if(cron.autoStart !== false) {
              cronService.start(cron.method)
            }
          })
        } else {
          // 記錄 cron
          recCron(crons)
          if(crons.autoStart !== false) {
            cronService.start(crons.method)
          }
        }
        console.log(crons)
                
      },
      jobsList: () => {
        return jobsTable.map(job=>job)
      },
      jobsRuning: () => {
        return jobsRunning.map(job=>job)
      },
      restart: (method: string) => {
        cronService.stop(method)
        cronService.start(method)
      },
      // 建立可以呼叫的定時器
      start: (method: string) => {
        // 若記錄執行中, 則不再啟動
        const runningIndex = jobsRunning.findIndex((i) => i.method === method )
        if (runningIndex != -1){
          return true
        }
        const jobIndex = jobsTable.findIndex((i) => i.method === method )
        // 取得當前的模組所有的方法(method)
        const instance:any = getCurrentInstance()
        const ctx = instance.ctx
        let locatedCronMethod = false
        if ( ctx[method] && jobIndex != -1){
          locatedCronMethod = true

          const cronJob = {
            timer: setInterval(() => {
              ctx[method].call()
            }, jobsTable[jobIndex].time),
            method: method,
            timerRunning: true,
            time: jobsTable[jobIndex].time,
            lastInvocation: + new Date()
          } as cronProps
          // 放入執行工作緒的陣列裡
          jobsRunning.push({...cronJob})

        }
        if (!locatedCronMethod){
          throw new Error(`Cron method '${method}' does not exist and cannot be started.`)
        }
      },
      stop: (method: string) => {
        const cronIndex = jobsRunning.findIndex((i) => i.method === method )
        let locatedCronMethod = false

        if (cronIndex != -1) {
          clearInterval(jobsRunning[cronIndex].timer)
          // remove job
          jobsRunning.splice(cronIndex, 1)
          locatedCronMethod = true
        }
        if (!locatedCronMethod){
          throw new Error(`Cron method '${method}' does not exist and cannot be stop.`)
        }
      }
    }

    if (options && options.cron !== undefined){
      cronService.add(options.cron)
    }
    app.config.globalProperties.$cron = cronService
    app.provide("cron", options)

    app.mixin({
      mounted() {
        // 取得有設定 cron:{} 的 component
        if (this.$options.cron !== undefined){
          //mapOrSingle(this.$options.cron, createTimer.bind(this))
          cronService.add(this.$options.cron)
        }
      }
    })

  }
}
 