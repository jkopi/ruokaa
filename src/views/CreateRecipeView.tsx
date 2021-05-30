import { Field, FieldArray, FieldArrayRenderProps, Form, Formik, FormikHelpers } from 'formik'
import React from 'react'
import styled from 'styled-components'
import cuid from 'cuid';
import { Recipe } from '../interfaces/Recipe'
import { timestamp, firestore } from '../config/firebase';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import Layout from '../components/Layout';
import * as Yup from 'yup';
import { Input } from '../components/Input';
import toast from 'react-hot-toast';

const FormInput = styled(Field)`
  padding: .5rem;
  font-size: 1rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  margin: .5rem;
`;

// const TextArea = styled.textarea`
//   min-width: 200px;
//   min-height: 50px;
// `;

const IngredientContainer = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
`;

const CreateRecipeView: React.FC = () => {
  const currentTime = timestamp.fromDate(new Date());
  const history = useHistory();

  const createRecipe = (values: Recipe) => {
    firestore
      .collection("recipes")
      .add(values)
      .then(() => {
        toast.success(`Created ${values.name}`);
        setTimeout(() => {
          history.push("/");
        }, 500)
      })
      .catch((error: Error) => {
        toast.error(`${error}`)
      })
  }

  const recipeSchema = Yup.object().shape({
    name: Yup.string()
      .min(0, "Please enter a recipe name!")
      .max(50, "Recipe name is too long!")
      .required("Recipe name is required!"),
    description: Yup.string()
      .min(0, "Please enter a description!")
      .max(150, "Description is too long!")
      .required("Recipe description is required!")
  });

  return (
    <Layout>
      <Link to="/">back</Link>
      <Formik
        initialValues={{
          id: cuid(),
          name: '',
          description: '',
          ingredients: [{ amount: '', name: '' }],
          createdAt: currentTime
        }}
        validationSchema={recipeSchema}
        onSubmit={(
          values: Recipe,
          { setSubmitting, resetForm }: FormikHelpers<Recipe>
        ) => {
          createRecipe(values);
          setSubmitting(false);
          resetForm();
          console.log(JSON.stringify(values));
        }}
      >
        {({ values }) => (
          <Form>
            <label htmlFor="name">
              <h3>Recipe name</h3>
            </label>
            <Input
              name="name"
              type="text"
              placeholder="Recipe name"
            />

            <label htmlFor="description">
              <h3>Description</h3>
            </label>
            <Input
              name="description"
              type="text"
              placeholder="Description"
            />

            <label htmlFor="ingredients">
              <h3>Ingredients</h3>
            </label>
            <FieldArray
              name="ingredients"
              render={(helpers: FieldArrayRenderProps) => (
                <div>
                  {values.ingredients?.map((_, index) => (
                    <IngredientContainer key={index}>
                      <FormInput placeholder="Amount" name={`ingredients[${index}].amount`} />
                      <FormInput placeholder="Name" name={`ingredients[${index}].name`} />
                      <Button onClick={() => helpers.remove(index)}>remove</Button>
                    </IngredientContainer>
                  ))}
                  <Button onClick={() => helpers.push({ amount: '', name: '' })}>Add new</Button>
                </div>
              )}
            />
            <hr />
            <button type="submit">Submit</button>
          </Form>
        )}
      </Formik>
    </Layout>
  )
}

export default CreateRecipeView