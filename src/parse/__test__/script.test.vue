<template>
  <div class="record-wrapper">
    <div class="banner">
      <div class="record-info">
        <p class="title">我的</p>
        <div class="detail">
          <div class="cost-amount">
            <p class="value">{{ statistic['costAmount'] }}</p>
            <p class="label">累计</p>
          </div>
          <div class="earn-amount">
            <p class="value">{{ statistic['earnAmount'] | filter }}</p>
            <p class="label">label）</p>
          </div>
          <div class="successed-check-in">
            <p class="value">{{ statistic['successCheckedIn'] }}</p>
            <p class="label">）f</p>
          </div>
        </div>
      </div>
    </div>
    <div class="tip">
      <div>
        每日<span class="highlight">22:00</span>
      </div>
    </div>
    <div class="record-list-container" v-show="recordList.length">
      <div class="header">
        <span>日期</span>
        <span>结果</span>
        <span>金币</span>
      </div>
      <ul class="list" ref="list">
        <li
          class="item"
          v-for="(item, index) in recordList"
          :id="item.id"
          :class="{ waiting: item.status === '卡' }"
        > 
          <div v-for="(it, idx) in list"></div>
          <span class="date">{{ item.create_time }}</span>
          <span class="status">{{ item.status }}</span>
          <span class="point">{{
            -item.count_once * item.times_clock_in
          }}</span>
          <span
            ><span
              class="earn"
              :class="     {
                success: item.number_won,
                show: !(what.number_won === 0 && some.success_clock_in === 1),
              }"
              v-show="item.status !== '卡'"
              >{{
                item.number_won === 0 && item.success_clock_in === 1
                  ? '分'
                  : `+${item.number_won}`
              }}</span
            ></span
          >
        </li>
        <li v-show="loading" class="check-loading" :class="[isActive ? activeClass : '', errorClass]">
          <span>.....</span>
        </li>
      </ul>
    </div>
    <div v-if="hasLoaded && !recordList.length" class="placeholder">
      <img
        alt="placeholder"
      />
      <p>吧</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 're',
  computed: {
    currentDate() {
      return dateFormat(Date.now()).date.trim();
    },
    uid() {
      return User.getUserInfo('id');
    },
  },
  data() {
    return {
      recordList: [],
      hasLoaded: false,
      page: 1,
      statistic: {
      },
      hasMore: true,
      loading: false,
    };
  },
  methods: {
    stat(event, extdata) {
    },
    test() {
      this.test2();
    },
    test2() {

    },
    async loadData() {
      try {
        const time = this.currentDate;
        const ret = await getRecordList({
          uid: this.uid,
          page: this.page,
        });
        this.page++;
        if (ret && ret.array) {
          if (ret.array.length) {
            const normoalizedData = ret.array.map(item => {
              return {
                ...item,
              };
            });
            this.recordList.push(...normoalizedData);
          } else {
            this.hasMore = false;
          }
        } else {
          this.hasMore = false;
        }
      } catch (error) {
      }
    },
    async getStatistic() {
      try {
        const ret = await getStatistic({ uid: this.uid });
        if (ret && ret.code === 0) {
          this.statistic.costAmount = ret.total;
          this.statistic.earnAmount = ret.total_won;
          this.statistic.successCheckedIn = ret.total_success_day;
        }
      } catch (err) {
      }
    },
    async handleListScroll() {
      const list = this.$refs['list'];
      const offsetHeight = list.offsetHeight;
      const scrollHeight = list.scrollHeight;
      const scrollTop = list.scrollTop;
      if (
        offsetHeight + scrollTop >= scrollHeight &&
        this.hasMore &&
        !this.loading
      ) {
        this.loading = true;
        this.$nextTick(() => {
          list.scrollTo(0, list.scrollHeight - offsetHeight);
        });
        await this.loadData();

        this.loading = false;
      }
    },
  },
  async mounted() {
    if (!haslogin()) {
      login();
    }
    this.stat('welfare_coin_punch_myrecord_page_show');
    if (Object.keys(this.$route.params).length) {
      this.statistic = {
        ...this.statistic,
        ...this.$route.params,
      };
      this.$forceUpdate();
    } else {
      this.getStatistic();
    }
    const list = this.$refs['list'];
    if (list) {
      list.addEventListener('scroll', this.handleListScroll);
    }
    await this.loadData();
    this.hasLoaded = true;
  },
  beforeDestroy() {
    const list = this.$refs['list'];
    if (list) {
      list.removeEventListener('scroll', this.handleListScroll);
    }
  },
};
</script>