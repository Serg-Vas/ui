let readyPed = 0;

on('logic:freemode:ready', ({ ped, model }) => {
  readyPed = ped;
  console.log(`[ui] freemode ready ped=${ped} model=${model}`);

  // Safe place to do overlay / component sync
  emit('logic:component:syncRequest');
});

// If this resource starts AFTER logic and misses the ready event:
on('onClientResourceStart', (res) => {
  console.log("ui onClientResourceStart", res);
  if (res !== GetCurrentResourceName()) return;
  console.log("ui requesting freemode status");
  // Ask logic resource to confirm or trigger freemode
  emit('logic:freemode:statusRequest');
});
