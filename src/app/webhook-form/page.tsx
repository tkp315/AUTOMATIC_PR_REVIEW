"use client";

import { z } from "zod";
import React, { useState } from "react";
import { SubmitHandler, useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useSession } from "next-auth/react";
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FiLoader } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Define input field data
const inputFieldData: Array<{
  field: keyof FormData;
  type: string;
  label: string;
}> = [
  { field: "owner", type: "text", label: "Owner Name" },
  { field: "repo", type: "text", label: "Repository Name" },
  { field: "webhookUrl", type: "text", label: "Webhook URL" },
];

// Define the form schema
const formSchema = z.object({
  owner: z.string().min(1, { message: "Owner name is required" }),
  repo: z.string().min(1, { message: "Repo name is required" }),
  webhookUrl: z.string().url({ message: "Invalid webhook URL" }),
});

// Infer the FormData type from the schema
type FormData = z.infer<typeof formSchema>;

function Page() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      owner: "",
      repo: "",
      webhookUrl: "",
    },
  });
  const { formState: { errors } } = form;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: session } = useSession();
   console.log(session)
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    // Check if session and access token are available
    if (!session || !session.accessToken) {
      console.error("Access token is not available");
      setErrorMessage("Access token is not available");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null); // Reset error message
    
    try {
      const dataObj = {
        owner : data.owner,
        repo : data.repo,
        webhookUrl : data.webhookUrl,
        accessToken:session.accessToken

      }
      // Send a POST request to create the webhook
      // const res = await axios.post("/api/create-webhook", { ...data, accessToken: session.accessToken }, {
      //   headers: {
      //     Authorization: `Bearer ${session.accessToken}`, // Pass the token in the Authorization header
      //     "Content-Type": "application/json",
      //   },
      // });
      const res = await axios.post("/api/greet",dataObj);
        
      console.log("Webh oo k created succ essfully and this is i ts da ta and it is absolutel y correc ted:", res.data);
    } catch (error) {
      console.error("Er r o r creatin g webhook here:", error);
      setErrorMessage("Failed to create webhook. Please try again.");
    } finally {
      setIsSubmitting(false);
      console.log("getting work done")
    }
  };
   console.log("Here I am changing the file and commiting the changes in repo: Automatic_PR_Review")
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-fit p-10 bg-slate-200 shadow-lg rounded-md">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-3 flex flex-col gap-4">
            {inputFieldData.map((item) => (
              <FormField
                key={item.field}
                control={form.control}
                name={item.field}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">{item.label}</FormLabel>
                    <FormControl>
                      <Input
                        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        {...field}
                        type={item.type}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs">
                      {errors[item.field]?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
            ))}
            {errorMessage && (
              <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="mr-2 h-4 w-4 animate-spin" /> Please wait
                </>
              ) : (
                "Save"
              )}
            </Button>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

export default Page;
