import hh from "hyperscript-helpers";
import { h, diff, patch } from "virtual-dom";
import createElement from "virtual-dom/create-element";

const { div, button, input, table, tr, th, td } = hh(h);

const messages = {
  addMeal: "ADD_MEAL",
  deleteMeal: "DELETE_MEAL",
  updateMealName: "UPDATE_MEAL_NAME",
  updateMealCalories: "UPDATE_MEAL_CALORIES",
};

function view(dispatch, model) {
  const buttonStyle = "bg-green-500 px-3 py-1 rounded-md text-white mt-4";

  return div({ className: "flex flex-col gap-4 items-center" }, [
    div({ className: "text-3xl font-bold" }, `Total Calories: ${model.totalCalories || 0}`),
    table({ className: "w-full border border-gray-300" }, [
      tr([th({ className: "text-left font-normal border" }, "Meal"), th({ className: "text-left font-normal border" }, "Calories")]),
      tr([
        td([
          input({
            className: "w-full border p-2",
            placeholder: "Enter meal name...",
            oninput: (e) => dispatch(messages.updateMealName, e.target.value),
            value: model.currentMeal.name,
          }),
        ]),
        td([
          input({
            className: "w-full border p-2",
            placeholder: "Enter calories number...",
            type: "number",
            oninput: (e) => dispatch(messages.updateMealCalories, e.target.value),
            value: model.currentMeal.calories,
          }),
        ]),
      ]),
    ]),
    button(
      {
        className: buttonStyle,
        onclick: () => dispatch(messages.addMeal),
      },
      "Add Meal"
    ),
    table({ className: "w-full mt-4 border border-gray-300" }, [
      tr([
        th({ className: "text-left font-semibold border" }, "Meal"),
        th({ className: "text-left font-semibold border" }, "Calories"),
        th({ className: "text-left font-semibold border" }, ""),
      ]),
      ...model.meals.map((meal, index) =>
        tr({ key: index }, [
          td([meal.name]),
          td([meal.calories.toString()]),
          td([
            button(
              {
                className: "text-red-500",
                onclick: () => dispatch(messages.deleteMeal, index),
              },
              "🗑"
            ),
          ]),
        ])
      ),
    ]),
  ]);
}

function update(message, model, value) {
  switch (message) {
    case messages.updateMealName:
      return {
        ...model,
        currentMeal: { ...model.currentMeal, name: value },
      };

    case messages.updateMealCalories:
      return {
        ...model,
        currentMeal: {
          ...model.currentMeal,
          calories: parseInt(value, 10) || 0,
        },
      };

    case messages.addMeal: {
      const newMeal = model.currentMeal;
      if (newMeal.name.trim() === "") return model;
      const meals = [...model.meals, newMeal];
      const totalCalories = meals.reduce((acc, meal) => acc + meal.calories, 0);
      return {
        ...model,
        meals,
        totalCalories,
        currentMeal: { name: "", calories: 0 },
      };
    }

    case messages.deleteMeal: {
      const meals = model.meals.filter((_, index) => index !== value);
      const totalCalories = meals.reduce((acc, meal) => acc + meal.calories, 0);
      return { ...model, meals, totalCalories };
    }

    default:
      return model;
  }
}

function app(initialModel, update, view, node) {
  let model = initialModel;
  let currentView = view(dispatch, model);
  let rootNode = createElement(currentView);
  node.appendChild(rootNode);

  function dispatch(message, value) {
    model = update(message, model, value);
    const updatedView = view(dispatch, model);
    const patches = diff(currentView, updatedView);
    rootNode = patch(rootNode, patches);
    currentView = updatedView;
  }
}

const initialModel = {
  meals: [],
  currentMeal: { name: "", calories: 0 },
  totalCalories: 0,
};

const rootNode = document.getElementById("app");
app(initialModel, update, view, rootNode);
