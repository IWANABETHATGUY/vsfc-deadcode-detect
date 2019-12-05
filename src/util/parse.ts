const lifeCircleList = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroy',
];
const nuxtConfigFunctionList = ['head'];
export function isLifeCircleFunction(name: string): boolean {
  return lifeCircleList.indexOf(name) !== -1;
}

export function isNuxtConfigFunction(name: string): boolean {
  return nuxtConfigFunctionList.indexOf(name) !== -1;
}
