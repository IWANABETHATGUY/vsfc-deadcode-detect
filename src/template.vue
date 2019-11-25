<template>
  <div class="record-wrapper">
    <div class="banner">
      <div class="record-info">
        <p class="title">我的战绩</p>
        <div class="detail">
          <div class="cost-amount">
            <p class="value">{{ statistic['costAmount'] }}</p>
            <p class="label">累计投入（金币）</p>
          </div>
          <div class="earn-amount">
            <p class="value">{{ statistic['earnAmount'] | filter }}</p>
            <p class="label">累计赚取（金币）</p>
          </div>
          <div class="successed-check-in">
            <p class="value">{{ statistic['successCheckedIn'] }}</p>
            <p class="label">成功打卡（天）</p>
          </div>
        </div>
      </div>
    </div>
    <div class="tip">
      <div>
        每日瓜分奖金将于<span class="highlight">22:00前</span>自动发放至您的账户
      </div>
    </div>
    <div class="record-list-container" v-show="recordList.length">
      <div class="header">
        <span>打卡日期</span>
        <span>打卡结果</span>
        <span>投入金币</span>
        <span>瓜分金币</span>
      </div>
      <ul class="list" ref="list">
        <li
          class="item"
          v-for="(item, index) in recordList"
          :id="item.id"
          :class="{ waiting: item.status === '待打卡' }"
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
              v-show="item.status !== '待打卡'"
              >{{
                item.number_won === 0 && item.success_clock_in === 1
                  ? '待瓜分'
                  : `+${item.number_won}`
              }}</span
            ></span
          >
        </li>
        <li v-show="loading" class="check-in-loading" :class="[isActive ? activeClass : '', errorClass]">
          <img src="@/assets/images/checkIn/loading.png" alt="loading" />
          <span>努力加载中</span>
        </li>
      </ul>
    </div>
    <div v-if="hasLoaded && !recordList.length" class="placeholder">
      <img
        src="@/assets/images/checkIn/record-placeholder.png"
        alt="placeholder"
      />
      <p>暂无记录，快去参与打卡挑战吧</p>
    </div>
  </div>
</template>

