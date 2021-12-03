import { getCurrentInstance } from "vue"
var jobsTable = []
var jobsRunning = []

const mapOrSingle = function(obj, fn){
  if(obj.constructor !== Array){
    return fn(obj)
  }
  else{
    return obj.map(fn)
  }
}

const recCron = (cron)=>{
  const jobIndex = jobsTable.findIndex((i) => i.method === cron.method )
  // 若jobsTable 有記錄, 則不再記錄
  if (jobIndex === -1){
    jobsTable.push({...cron})
  }
}

const createTimer = function(cron){
  this._cron = this._cron || {}
  const method = cron.method
  // 記錄 cron
  recCron(cron)
  if(this._cron[method] && this._cron[method].timerRunning) return

  if(cron.autoStart === false){
    this._cron[method] = { timerRunning: false }
  } else {

    let locatedCronMethod = false
    // 找尋當前的模組是否有要執行的方法(method)
    if (this.$options.methods[method] ) {
      locatedCronMethod = true

      this._cron[method] = {
        timer: setInterval(() => {
          this.$options.methods[method].call(this)
        }, cron.time),
        method: method,
        timerRunning: true,
        time: cron.time,
        lastInvocation: + new Date()
      }
      // 放入執行工作緒的陣列裡
      jobsRunning.push({...this._cron[method]})
    }
    // 當前的component 找不到要執行的方法(method)時拋出錯誤, 不讓程式往下執行
    if (!locatedCronMethod){
      throw new Error(`Cron method '${method}' does not exist.`)
    }
  }
}

export default {
  install: (app, options) => {
    const cronService = {
      add: (cron) => {
        // 記錄 cron
        recCron(cron)
        if(cron.autoStart !== false) {
          cronService.start(cron.method)
        }
      },
      jobsList: () => {
        return jobsTable.map(job=>job)
      },
      jobsRuning: () => {
        return jobsRunning.map(job=>job)
      },
      restart: method => {
        cronService.stop(method)
        cronService.start(method)
      },
      start: method => {
        // 若記錄執行中, 則不再啟動
        const runningIndex = jobsRunning.findIndex((i) => i.method === method )
        if (runningIndex != -1){
          return true
        }
        const jobIndex = jobsTable.findIndex((i) => i.method === method )
        // 取得當前的模組所有的方法(method)
        const { ctx } = getCurrentInstance()
        let locatedCronMethod = false
        if ( ctx[method] && jobIndex != -1){
          locatedCronMethod = true

          const cronJob = {
            timer: setInterval(() => {
              ctx[method].call(this)
            }, jobsTable[jobIndex].time),
            method: method,
            timerRunning: true,
            time: jobsTable[jobIndex].time,
            lastInvocation: + new Date()
          }
          // 放入執行工作緒的陣列裡
          jobsRunning.push({...cronJob})

        }
        if (!locatedCronMethod){
          throw new Error(`Cron method '${method}' does not exist and cannot be started.`)
        }
      },
      stop: method => {
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
          mapOrSingle(this.$options.cron, createTimer.bind(this))
        }
      }
    })

  }
}
 