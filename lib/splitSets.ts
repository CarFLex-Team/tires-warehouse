export default function splitSets(currentQuantity: number) {
  console.log("Current quantity in set:", currentQuantity);
  const quantityToUsed = currentQuantity % 4;
  const newSetQuantity = currentQuantity - quantityToUsed;
  console.log("Quantity to move to used:", quantityToUsed);
  console.log("New set quantity:", newSetQuantity);
  return { quantityToUsed, newSetQuantity };
}
