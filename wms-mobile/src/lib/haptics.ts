/** Wrapper de háptico — feedback físico importa no chão (barulho, luva, frio). */
import * as Haptics from 'expo-haptics';

export const tapLeve = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
export const tapMedio = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
export const sucesso = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
export const erro = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
