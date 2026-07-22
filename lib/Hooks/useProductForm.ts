import { useEffect, useState } from "react";

export type Condition = "USED" | "NEW" | "SET" | "";

export function useProductForm() {
  const [size1, setSize1] = useState("");
  const [size2, setSize2] = useState("");
  const [size3, setSize3] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [quantity, setQuantity] = useState("");
  const [condition, setCondition] = useState<Condition>("");
  const [category, setCategory] = useState<"Tires" | "Rims" | "">("");
  const [isPercent, setIsPercent] = useState(false);
  const [markupPercent, setMarkupPercent] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPercent) {
      const costNum = parseFloat(cost);
      const markupNum = parseFloat(markupPercent);
      if (!isNaN(costNum) && !isNaN(markupNum)) {
        setPrice((costNum + (costNum * markupNum) / 100).toFixed(0));
      } else {
        setPrice("");
      }
    }
  }, [cost, markupPercent, isPercent]);

  function reset() {
    setSize1("");
    setSize2("");
    setSize3("");
    setBrand("");
    setPrice("");
    setCost("");
    setQuantity("");
    setCondition("");
    setCategory("");
    setIsPercent(false);
    setMarkupPercent("");
    setError(null);
  }

  function validate() {
    if (
      !condition ||
      !size1 ||
      !size2 ||
      !size3 ||
      !brand ||
      !price ||
      !cost ||
      !quantity ||
      !category ||
      isNaN(Number(price)) ||
      isNaN(Number(cost)) ||
      isNaN(Number(quantity))
    ) {
      setError("Please fill in fields with valid numbers");
      return false;
    }
    setError(null);
    return true;
  }

  function getPayload() {
    return {
      condition: condition as Exclude<Condition, "">,
      size: `${size1}/${size2}/${size3}`,
      brand,
      price: Number(price),
      cost: Number(cost),
      quantity: Number(quantity),
      category: category as "Tires" | "Rims",
    };
  }

  return {
    values: {
      size1,
      size2,
      size3,
      brand,
      price,
      cost,
      quantity,
      category,
      condition,
      isPercent,
      markupPercent,
      error,
    },
    setters: {
      setSize1,
      setSize2,
      setSize3,
      setBrand,
      setPrice,
      setCost,
      setQuantity,
      setCategory,
      setCondition,
      setIsPercent,
      setMarkupPercent,
    },
    reset,
    validate,
    getPayload,
  };
}

export type ProductForm = ReturnType<typeof useProductForm>;
