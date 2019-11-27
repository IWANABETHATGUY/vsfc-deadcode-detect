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

export function isLifeCircleFunction(name: string): boolean {
  return lifeCircleList.indexOf(name) !== -1;
}
