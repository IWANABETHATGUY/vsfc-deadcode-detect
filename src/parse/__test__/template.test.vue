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


