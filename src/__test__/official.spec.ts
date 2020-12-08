import { unusedToken } from '..';
import { isTwoSortedArrayEqual } from '../util/testUtil';

describe('使用官方eslint-vue-plugin 测试样例', () => {
  test('a property used as a template identifier ', () => {
    const code = `<template>
    <div>{{ count }}</div>
  </template>
  <script>
    export default {
      props: ['count']
    }
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      []
    );
  });

  test('properties used in a template expression ', () => {
    const code = `<template>
    <div>{{ count1 + count2 }}</div>
  </template>
  <script>
    export default {
      props: ['count1', 'count2']
    };
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      []
    );
  });

  test('a property used in v-if', () => {
    const code = `<template>
    <div v-if="count > 0"></div>
  </template>
  <script>
    export default {
      props: {
        count: {
          type: Number
        }
      }
    };
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      []
    );
  });

  test('a property used in v-for', () => {
    const code = `<template>
    <div v-for="color in colors">{{ color }}</div>
  </template>
  <script>
    export default {
      props: {
        colors: {
          type: Array,
          default: () => []
        }
      }
    };
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      []
    );
  });

  test('a property used in v-html', () => {
    const code = `
    <template>
          <div v-html="message" />
        </template>
        <script>
          export default {
            props: ['message']
          };
        </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      []
    );
  });

  test('a property passed in a component', () => {
    const code = `<template>
    <counter :count="count" />
  </template>
  <script>
    export default {
      props: ['count']
    };
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      []
    );
  });

  test('a property used in v-on', () => {
    const code = `<template>
    <button @click="alert(count)" />
  </template>
  <script>
    export default {
      props: ['count']
    };
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      []
    );
  });

  test('data used in a script expression', () => {
    const code = `<script>
    export default {
      data () {
        return {
          count: 2
        };
      },
      created() {
        alert(this.count + 1)
      }
    };
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      []
    );
  });

  test(' data used as a template identifier', () => {
    const code = `<template>
    <div>{{ count }}</div>
  </template>
  <script>
    export default {
      data () {
        return {
          count: 2
        };
      }
    }
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      []
    );
  });

  test('data used in a template expression', () => {
    const code = `<template>
    <div>{{ count1 + count2 }}</div>
  </template>
  <script>
    export default {
      data () {
        return {
          count1: 1,
          count2: 2
        };
      }
    };
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      []
    );
  });

  test('data used in v-if ', () => {
    const code = `<template>
    <div v-if="count > 0"></div>
  </template>
  <script>
    export default {
      data () {
        return {
          count: 2
        };
      }
    };
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      []
    );
  });

  test('data used in v-for', () => {
    const code = `<template>
    <div v-for="color in colors">{{ color }}</div>
  </template>
  <script>
    export default {
      data () {
        return {
          colors: ["purple", "green"]
        };
      }
    };
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      []
    );
  });

  test('data used in v-html', () => {
    const code = `<template>
    <div v-html="message" />
  </template>
  <script>
    export default {
      data () {
        return {
          message: "<span>Hey!</span>"
        };
      }
    };
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      []
    );
  });

  test('data used in v-model', () => {
    const code = `<template>
    <input v-model="count" />
  </template>
  <script>
    export default {
      data () {
        return {
          count: 2
        };
      }
    };
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      []
    );
  });

  test('data passed in a component', () => {
    const code = `<template>
    <counter :count="count" />
  </template>
  <script>
    export default {
      data () {
        return {
          count: 2
        };
      }
    };
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      []
    );
  });

  test(' data used in v-on', () => {
    const code = `<template>
    <button @click="count++" />
  </template>
  <script>
    export default {
      data () {
        return {
          count: 2
        };
      }
    };
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      []
    );
  });

  test('computed property used in a script expression', () => {
    const code = ` <script>
    export default {
      computed: {
        count() {
          return 2;
        }
      },
      created() {
        const dummy = this.count + 1;
      }
    };
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      []
    );
  });

  test('computed property used as a template identifier ', () => {
    const code = `<template>
    <div>{{ count }}</div>
  </template>
  <script>
    export default {
      computed: {
        count() {
          return 2;
        }
      }
    }
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      []
    );
  });

  test('computed properties used in a template expression ', () => {
    const code = `<template>
    <div>{{ count1 + count2 }}</div>
  </template>
  <script>
    export default {
      computed: {
        count1() {
          return 1;
        },
        count2() {
          return 2;
        }
      }
    }
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      []
    );
  });

  test('computed property used in v-if', () => {
    const code = `<template>
    <div v-if="count > 0"></div>
  </template>
  <script>
    export default {
      computed: {
        count() {
          return 2;
        }
      }
    }
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      []
    );
  });
  test('computed property used in v-for', () => {
    const code = `<template>
    <div v-for="color in colors">{{ color }}</div>
  </template>
  <script>
    export default {
      computed: {
        colors() {
          return ["purple", "green"];
        }
      }
    };
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      []
    );
  });
  test('computed property used in v-html', () => {
    const code = `<template>
    <div v-html="message" />
  </template>
  <script>
    export default {
      computed: {
        message() {
          return "<span>Hey!</span>";
        }
      }
    };
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      []
    );
  });

  test('computed property used in v-model', () => {
    const code = `<template>
    <input v-model="fullName" />
  </template>
  <script>
    export default {
      data() {
        return {
          firstName: "David",
          lastName: "Attenborough"
        }
      },
      computed: {
        fullName: {
          get() {
            return this.firstName + ' ' + this.lastName
          },
          set(newValue) {
            var names = newValue.split(' ')
            this.firstName = names[0]
            this.lastName = names[names.length - 1]
          }
        }
      }
    };
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      []
    );
  });

  test('computed property passed in a component', () => {
    const code = `<template>
    <counter :count="count" />
  </template>
  <script>
    export default {
      computed: {
        count() {
          return 2;
        }
      }
    }
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      []
    );
  });

  test('unused property', () => {
    const code = `<template>
    <div>{{ cont }}</div>
  </template>
  <script>
    export default {
      props: ['count']
    };
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      ['count']
    );
  });

  test('unused data', () => {
    const code = `<template>
    <div>{{ cont }}</div>
  </template>
  <script>
    export default {
      data () {
        return {
          count: 2
        };
      }
    };
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      ['count']
    );
  });

  test('unused computed property', () => {
    const code = `<template>
    <div>{{ cont }}</div>
  </template>
  <script>
    export default {
      computed: {
        count() {
          return 2;
        }
      }
    };
  </script>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      ['count']
    );
  });
// won't emit any error, if the script is empty 
  test('only template', () => {
    const code = `
<template>
    <div>{{ count }}</div>
  </template>`;
    isTwoSortedArrayEqual(
      unusedToken(code).map((item) => item.name),
      []
    );
  });
});
