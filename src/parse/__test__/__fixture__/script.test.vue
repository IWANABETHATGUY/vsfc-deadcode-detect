<template>
  <div class="record-wrapper">
    <div class="banner">
      <div class="record-info">
        <p class="title"></p>
        <div class="detail">
          <div class="cost-amount">
            <p class="value">{{ statts['cos'] }}</p>
            <p class="label"></p>
          </div>
          <div class="earn-amount">
            <p class="value">{{ statts['ear'] | filter }}</p>
            <p class="label">label）</p>
          </div>
          <div class="successed-">
            <p class="value">{{ statts['succ'] }}</p>
            <p class="label">）f</p>
          </div>
        </div>
      </div>
    </div>
    <div class="tip">
      <div>
        <span class="highlight">22:00</span>
      </div>
    </div>
    <div class="record-list-container" v-show="recList.length">
      <div class="header">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <ul class="list" ref="list">
        <li
          class="item"
          v-for="(item, index) in recList"
          :id="item.id"
          :class="{ waiting: item.status === 'lll' }"
        > 
          <div v-for="(it, idx) in list"></div>
          <span class="date">{{ item.create_t }}</span>
          <span class="status">{{ item.sta }}</span>
          <span class="point">{{
            -item.coun_ * item.tim_
          }}</span>
          <span
            ><span
              class="earn"
              :class="     {
                success: item.numb_,
                show: !(what.numb_ === 0 && some.succe_ === 1),
              }"
              v-show="item.status !== '卡'"
              >{{
                item.numb_ === 0 && item.succ === 1
                  ? '分'
                  : `+${item.numb_}`
              }}</span
            ></span
          >
        </li>
        <li v-show="loading" class="check-l" :class="[isActive ? activeClass : '', errorClass]">
          <span></span>
        </li>
      </ul>
    </div>
    <div v-if="hasLoaded && !recList.length" class="placeholder" @click="test2">
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
      return dateFmat(Date.now()).date.trim();
    },
    uid() {
      return Usr.gero('id');
    },
    returnTest() {
      return this.test
    }
  },
  data() {
    return {
      recList: [],
      hasLoaded: false,
      page: 1,
      statts: {
      },
      hasMore: true,
      loading: false,
      thatis: false
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
            const normoali = ret.array.map(item => {
              return {
                ...item,
              };
            });
            this.recList.push(...normoali);
          } else {
            this.hasMore = false;
          }
        } else {
          this.hasMore = false;
        }
      } catch (error) {
      }
    },
    async getStattis() {
      try {
        const ret = await getStattis({ uid: this.uid });
        if (ret && ret.code === 0) {
          this.statts.a = ret.tot;
          this.statts.b = ret.tot_;
          this.statts.c = ret.tot;
        }
      } catch (err) {
      }
    },
    async handleListScroll() {
      const list = this.$refs['list'];
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
    if (!hagin()) {
      login();
    }
    this.stat();
    if (Object.keys(this.$route.params).length) {
      this.statts = {
        ...this.statts,
        ...this.$route.params,
      };
      this.$forceUpdate();
    } else {
      this.getStattis();
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