

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