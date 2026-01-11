let readyPed = 0;
let appearanceInfo = null;

on('logic:freemode:ready', ({ ped, model }) => {
  readyPed = ped;
  console.log(`[ui] freemode ready ped=${ped} model=${model}`);

  emit('logic:component:syncRequest');
  emit('logic:appearance:infoRequest');
});

on('onClientResourceStart', (res) => {
  console.log("ui onClientResourceStart", res);
  if (res !== GetCurrentResourceName()) return;
  SetNuiFocus(true, true);
  console.log("ui requesting freemode status");
  emit('logic:freemode:statusRequest');
  emit('logic:appearance:infoRequest');
});

RegisterNuiCallbackType("appearance:apply");
on("__cfx_nui:appearance:apply", (data, cb) => {
  console.log("[ui] NUI appearance:apply", data);
  emit("logic:appearance:apply", data || {});
  cb({ ok: true });
});

RegisterNuiCallbackType("appearance:changeSex");
on("__cfx_nui:appearance:changeSex", (data, cb) => {
  console.log("[ui] NUI appearance:changeSex", data);
  emit("logic:appearance:changeSex", Number(data?.sex ?? 0));
  cb({ ok: true });
});

on('ui:appearance:info', (info) => {
  console.log("[ui] appearance:info", JSON.stringify(info));
  appearanceInfo = info;
  SendNUIMessage({ type: 'appearance:info', payload: info });
});
