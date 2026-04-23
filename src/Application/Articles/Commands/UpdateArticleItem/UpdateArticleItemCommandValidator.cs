namespace clean.Application.Articles.Commands.UpdateArticleItem;

public class UpdateArticleItemCommandValidator : AbstractValidator<UpdateArticleItemCommand>
{
    public UpdateArticleItemCommandValidator()
    {
        RuleFor(v => v.Title)
            .MaximumLength(200)
            .NotEmpty();

        RuleFor(v => v.Content)
            .NotEmpty();
    }
}
