import { useMutation, useQueryClient } from "@tanstack/react-query";

const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  const { mutate: updateProfile, ispending: isUpdatingProfile } = useMutation({
    mutationFn: async (formData) => {
      try {
        const res = await fetch(`/api/users/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ formData }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went worng");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
      ]);
    },
  });
  return { updateProfile, isUpdatingProfile };
};

export default useUpdateUserProfile;
