import { DefaultValues, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from '@hookform/resolvers/zod'

export const useZodForm = <T extends z.useZodType<any>>(
    schema: T,
    defaultValues?: DefaultValues<z.TypeOf<T>> | undefined
) => {
    const {
        register,
        formState: { errors },
        handleSubmit,
        watch,
        reset
    } = useForm<z.inter<T>>({
        resolver: zodResolver(schema)
    })

    return { register, errors, handleSubmit, watch, reset }
}