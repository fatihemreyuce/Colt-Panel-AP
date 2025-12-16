import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
	steps: {
		id: string;
		label: string;
		description?: string;
	}[];
	currentStep: number;
	onStepClick?: (step: number) => void;
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
	return (
		<div className="w-full">
			<div className="flex items-center justify-between">
				{steps.map((step, index) => {
					const isActive = index === currentStep;
					const isCompleted = index < currentStep;
					const isClickable = onStepClick && (isCompleted || index === currentStep);

					return (
						<React.Fragment key={step.id}>
							<div className="flex flex-col items-center flex-1">
								<button
									type="button"
									onClick={() => isClickable && onStepClick?.(index)}
									disabled={!isClickable}
									className={cn(
										"flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
										isCompleted
											? "bg-primary border-primary text-primary-foreground"
											: isActive
												? "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20"
												: "bg-background border-muted-foreground text-muted-foreground",
										isClickable && "cursor-pointer hover:scale-110",
										!isClickable && "cursor-not-allowed"
									)}
								>
									{isCompleted ? (
										<Check className="h-5 w-5" />
									) : (
										<span className="text-sm font-semibold">{index + 1}</span>
									)}
								</button>
								<div className="mt-2 text-center">
									<p
										className={cn(
											"text-sm font-semibold",
											isActive || isCompleted
												? "text-foreground"
												: "text-muted-foreground"
										)}
									>
										{step.label}
									</p>
									{step.description && (
										<p
											className={cn(
												"text-xs mt-1",
												isActive || isCompleted
													? "text-muted-foreground"
													: "text-muted-foreground/60"
											)}
										>
											{step.description}
										</p>
									)}
								</div>
							</div>
							{index < steps.length - 1 && (
								<div className="flex-1 mx-4">
									<div
										className={cn(
											"h-0.5 transition-all",
											isCompleted ? "bg-primary" : "bg-muted"
										)}
									/>
								</div>
							)}
						</React.Fragment>
					);
				})}
			</div>
		</div>
	);
}

