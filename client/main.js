let readyPed = 0;
let appearanceInfo = null; // Cache appearance data here
// SetNuiFocus(true, true);

on('logic:freemode:ready', ({ ped, model }) => {
  readyPed = ped;
  console.log(`[ui] freemode ready ped=${ped} model=${model}`);

  // Safe place to do overlay / component sync
  emit('logic:component:syncRequest');
  emit('logic:appearance:infoRequest');
});

// If this resource starts AFTER logic and misses the ready event:
on('onClientResourceStart', (res) => {
  console.log("ui onClientResourceStart", res);
  if (res !== GetCurrentResourceName()) return;
  SetNuiFocus(true, true);
  console.log("ui requesting freemode status");
  // Ask logic resource to confirm or trigger freemode
  emit('logic:freemode:statusRequest');
  emit('logic:appearance:infoRequest');
});

RegisterNuiCallbackType("appearance:apply");
on("__cfx_nui:appearance:apply", (data, cb) => {
  console.log("[ui] NUI appearance:apply", data);
  emit("logic:appearance:apply", data || {});
  cb({ ok: true });
});

// Cache the appearance info when it arrives
on('ui:appearance:info', (info) => {
  console.log("[ui] appearance:info", JSON.stringify(info));
  appearanceInfo = info; // Store it here
  SendNUIMessage({ type: 'appearance:info', payload: info });
});
