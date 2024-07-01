"use client";
import React, { Dispatch, FC, HTMLAttributes, SetStateAction, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type props = {
	prompt: string,
	options: string[],
	value?: string,
	onValueChange?: Dispatch<SetStateAction<string>>,
} & HTMLAttributes<HTMLDivElement>;

const ComboBox : FC<props> = (props : props) => {
	const [open, setOpen] = useState(false);

	let options : string[] = props.options;
	let prompt : string = props.prompt;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={ `w-[200px] justify-between shadow-sm ${props.className}` }
					id={props.id}
				>
					{props.value
						? options.find((option) => option.toUpperCase() === props.value.toUpperCase())
						: prompt }
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="p-0">
				<Command>
					<CommandInput placeholder="Search..." />
					<CommandEmpty>Not found</CommandEmpty>
					<CommandGroup className="max-h-64 overflow-scroll">
						{options.map((option) => (
							<CommandItem
								className="cursor-pointer border-b"
								key={option}
								value={option}
								onSelect={(currentValue) => {
									props.onValueChange(currentValue)
									setOpen(false)
								}}
							>
								<Check
									className={cn(
										"mr-2 h-4 w-4",
										props.value === option ? "opacity-100" : "opacity-0"
									)}
								/>
								{option}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	)
}

export default ComboBox;