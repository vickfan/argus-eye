import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import moment from 'moment'

const MAX_CONSECUTIVE_FAILURES = 3
export class StatusTracker {
  constructor({ supabaseUrl, supabaseKey }) {
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      realtime: { transport: ws },
    })
  }

  async check(sourceName) {
    return this.supabase
      .from('scraper_status')
      .select('*')
      .eq('source_name', sourceName)
      .single()
  }

  async shouldCrawl(sourceName) {
    const { data, error } = await this.check(sourceName)
    if (error || !data) {
      return true
    }

    if (data.status === 'FUSED' && data.fused_until) {
      const now = moment()
      const fusedUntil = moment(data.fused_until)
      if (now.isAfter(fusedUntil)) {
        return true
      }
      return false
    }
    return true
  }

  async update(sourceName, isSuccess) {
    try {
      const { data } = await this.supabase
        .from('scraper_status')
        .select('consecutive_failures')
        .eq('source_name', sourceName)
        .single()

      let currentFailures = data ? data.consecutive_failures : 0

      let updateData = {
        source_name: sourceName,
        last_run: moment().format('YYYY-MM-DD HH:mm:ss'),
      }

      if (isSuccess) {
        updateData.status = 'ACTIVE'
        updateData.consecutive_failures = 0
        updateData.fused_until = null
      } else {
        currentFailures += 1
        updateData.consecutive_failures = currentFailures

        if (currentFailures >= MAX_CONSECUTIVE_FAILURES) {
          updateData.status = 'FUSED'
          updateData.fused_until = moment().add(7, 'days').format('YYYY-MM-DD HH:mm:ss')
        }
      }

      await this.supabase
        .from('scraper_status')
        .upsert(updateData, { onConflict: 'source_name' })
    } catch (error) {
      
    }
  }
}